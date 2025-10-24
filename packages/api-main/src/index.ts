import { cors } from '@elysiajs/cors';
import node from '@elysiajs/node';
import { Elysia } from 'elysia';

import { authRoutes } from './routes/auth';
import { moderatorRoutes } from './routes/moderator';
import { publicRoutes } from './routes/public';
import { readerRoutes } from './routes/reader';
import { userRoutes } from './routes/user';
import { useConfig } from './config';
import { startBot as startTelegramBot } from './telegram/bot';

const config = useConfig();
const app = new Elysia({ adapter: node(), prefix: '/v1' });

export async function start() {
    app.use(cors());
    app.use(publicRoutes);
    app.use(authRoutes);
    app.use(readerRoutes);
    app.use(userRoutes);
    app.use(moderatorRoutes);

    app.listen(config.PORT);
    startTelegramBot();
}

if (!process.env.SKIP_START) {
    start();
}
