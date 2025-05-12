import amqplib from 'amqplib';

import { useConfig } from './config';

const config = useConfig();

const _apiRoot = process.env.API_ROOT || 'http://localhost:3000';

const start = async () => {
    const conn = await amqplib.connect(config.rabbitMQEndpoint);
    const channel = await conn.createChannel();
    await channel.assertExchange(config.logExchange, 'direct', { durable: config.durable });
    await channel.assertQueue(config.logQueue, { durable: config.durable });
    await channel.consume(config.logQueue, async (msg) => {
        console.log('Logging failed message: ', msg?.content.toString());
    });
};
start();
