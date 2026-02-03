const asArray = (value) => (Array.isArray(value) ? value : []);

export default async function chatRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const userId = request.user.sub;
    const { rows } = await fastify.db.query(
      'SELECT id, user_id, name, messages, code, created_at, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  });

  fastify.post('/', async (request, reply) => {
    const userId = request.user.sub;
    const name = String(request.body?.name || 'New chat');

    const { rows } = await fastify.db.query(
      'INSERT INTO chats (user_id, name, messages, code) VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, messages, code, created_at, updated_at',
      [userId, name, JSON.stringify([]), '']
    );

    return reply.code(201).send(rows[0]);
  });

  fastify.post('/import', async (request, reply) => {
    const userId = request.user.sub;
    const chats = asArray(request.body?.chats);

    if (chats.length === 0) {
      return reply.send({ imported: 0 });
    }

    if (chats.length > 50) {
      return reply.code(400).send({ error: 'Too many chats to import.' });
    }

    const client = await fastify.db.connect();
    try {
      await client.query('BEGIN');
      for (const chat of chats) {
        const name = String(chat?.name || 'New chat');
        const messages = JSON.stringify(chat?.messages ?? []);
        const code = String(chat?.code || '');
        const createdAt = chat?.created_at ? new Date(chat.created_at) : new Date();
        const updatedAt = chat?.updated_at ? new Date(chat.updated_at) : new Date();

        await client.query(
          'INSERT INTO chats (user_id, name, messages, code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, name, messages, code, createdAt, updatedAt]
        );
      }
      await client.query('COMMIT');
      return reply.send({ imported: chats.length });
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to import chats.' });
    } finally {
      client.release();
    }
  });

  fastify.patch('/:id', async (request, reply) => {
    const userId = request.user.sub;
    const chatId = request.params.id;
    const updates = request.body || {};

    const fields = [];
    const values = [];
    let idx = 1;

    if (typeof updates.name === 'string') {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }

    if (typeof updates.messages !== 'undefined') {
      fields.push(`messages = $${idx++}`);
      values.push(JSON.stringify(updates.messages || []));
    }

    if (typeof updates.code === 'string') {
      fields.push(`code = $${idx++}`);
      values.push(updates.code);
    }

    if (fields.length === 0) {
      return reply.code(400).send({ error: 'No fields to update.' });
    }

    values.push(chatId, userId);

    const { rows } = await fastify.db.query(
      `UPDATE chats SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING id, user_id, name, messages, code, created_at, updated_at`,
      values
    );

    const chat = rows[0];
    if (!chat) {
      return reply.code(404).send({ error: 'Chat not found.' });
    }

    return chat;
  });

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.user.sub;
    const chatId = request.params.id;

    const { rowCount } = await fastify.db.query(
      'DELETE FROM chats WHERE id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (rowCount === 0) {
      return reply.code(404).send({ error: 'Chat not found.' });
    }

    return reply.code(204).send();
  });
}
