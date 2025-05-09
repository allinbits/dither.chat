import amqplib from 'amqplib';

import { useConfig } from './config';

const config = useConfig();

const _apiRoot = process.env.API_ROOT || 'http://localhost:3000';

const start = async () => {
    const conn = await amqplib.connect(config.rabbitMQEndpoint);
    const channel = await conn.createChannel();
    await channel.assertExchange(config.exchange, 'fanout', { durable: config.durable });
    await channel.assertQueue(config.queue, { durable: config.durable, deadLetterExchange: 'dither', messageTtl: 1000 * 10 });
    await channel.consume(config.queue, async (msg) => {
        if (msg) {
            try {
                if (msg.properties.headers && msg.properties.headers['x-death'] && msg.properties.headers['x-death'].length > 0 && msg.properties.headers['x-death'][0].count > 3) {
                    console.log('Message has been retried more than 3 times, storing to investiogate.');
                    // POST to API
                    channel.ack(msg);
                    return;
                }
                else {
                    console.log('Requeueing.');
                    channel.reject(msg);
                }
            }
            catch (error) {
                console.error('Error processing message:', error);
                console.error('Error processing message:', msg);
                channel.ack(msg);
            }
        }
    });
};
start();
