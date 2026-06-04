import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

const app = fastify({ logger: true });

// 注册插件
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'freshdash-dev-secret' });

// 健康检查
app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }));

// 根路由
app.get('/', async () => ({ message: 'FreshDash API Server', version: '1.0.0' }));

// TODO: 注册业务路由模块
// app.register(require('./routes/auth'), { prefix: '/api/auth' });
// app.register(require('./routes/product'), { prefix: '/api/products' });
// app.register(require('./routes/order'), { prefix: '/api/orders' });
// app.register(require('./routes/promoter'), { prefix: '/api/promoters' });
// app.register(require('./routes/supplier'), { prefix: '/api/suppliers' });
// app.register(require('./routes/admin'), { prefix: '/api/admin' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
