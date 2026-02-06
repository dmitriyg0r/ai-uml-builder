import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chats.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'change_me',
});

fastify.decorate('db', pool);

fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.get('/health', async () => ({ status: 'ok' }));
fastify.get('/', async () => ({ status: 'ok', service: 'ai-uml-builder-server' }));
fastify.get('/favicon.ico', async (_request, reply) => reply.code(204).send());

fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(chatRoutes, { prefix: '/chats' });

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3001);
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
