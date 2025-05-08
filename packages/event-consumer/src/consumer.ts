import type { EventConsumerConfig } from './types';

import amqplib from 'amqplib';

export class EventConsumer {
    private channel!: amqplib.Channel;
    private config: EventConsumerConfig;
    private handler: (msg: amqplib.Message) => Promise<boolean>;
    constructor(config: EventConsumerConfig, handler: (msg: amqplib.Message) => Promise<boolean>) {
        this.config = config;
        this.handler = handler.bind(this);
    }

    async connect() {
        const conn = await amqplib.connect(this.config.rabbitMQEndpoint);
        this.channel = await conn.createChannel();
        await this.channel.assertExchange(this.config.exchange, 'direct', { durable: this.config.durable });
        await this.channel.assertQueue(this.config.queue, { durable: this.config.durable });
    }

    async consume() {
        this.channel.consume(this.config.queue, async (msg) => {
            if (msg) {
                try {
                    const res = await this.handler(msg);
                    if (res) {
                        this.channel.ack(msg);
                    }
                    else {
                        this.channel.nack(msg);
                    }
                }
                catch (error) {
                    console.error('Error processing message:', error);
                    this.channel.nack(msg);
                }
            }
        });
    }
}
