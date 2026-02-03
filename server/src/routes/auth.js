import bcrypt from 'bcryptjs';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export default async function authRoutes(fastify) {
  fastify.post('/register', async (request, reply) => {
    const email = normalizeEmail(request.body?.email);
    const password = String(request.body?.password || '');

    if (!email || !password || password.length < 6) {
      return reply.code(400).send({ error: 'Invalid email or password.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const { rows } = await fastify.db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
      );

      const user = rows[0];
      const token = fastify.jwt.sign({ sub: user.id, email: user.email });
      return reply.send({ user, token });
    } catch (err) {
      if (err?.code === '23505') {
        return reply.code(409).send({ error: 'User already exists.' });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to register.' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    const email = normalizeEmail(request.body?.email);
    const password = String(request.body?.password || '');

    if (!email || !password) {
      return reply.code(400).send({ error: 'Invalid email or password.' });
    }

    const { rows } = await fastify.db.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials.' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return reply.code(401).send({ error: 'Invalid credentials.' });
    }

    const token = fastify.jwt.sign({ sub: user.id, email: user.email });
    return reply.send({
      user: { id: user.id, email: user.email, created_at: user.created_at },
      token,
    });
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { rows } = await fastify.db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    return reply.send({ user });
  });
}
