import type { EventConsumerConfig } from './types';

import amqplib from 'amqplib';

export enum HandlerResponse {
    SUCCESS = 'success',
    FAILURE = 'failure',
    REJECT = 'reject',
}
export class EventConsumer {
    private channel!: amqplib.Channel;
    private config: EventConsumerConfig;
    private handler: (msg: amqplib.Message) => Promise<HandlerResponse>;
    constructor(config: EventConsumerConfig, handler: (msg: amqplib.Message) => Promise<HandlerResponse>) {
        this.config = config;
        this.handler = handler.bind(this);
    }

    async connect() {
        const conn = await amqplib.connect(this.config.rabbitMQEndpoint);
        this.channel = await conn.createChannel();
        await this.channel.assertExchange(this.config.exchange, 'direct', { durable: this.config.durable });
        await this.channel.assertExchange(this.config.logExchange, 'direct', { durable: this.config.durable });
        await this.channel.assertQueue(this.config.logQueue, { durable: this.config.durable });
        await this.channel.assertQueue(this.config.queue, { durable: this.config.durable, deadLetterExchange: this.config.dlxExchange });
    }

    async consume() {
        this.channel.consume(this.config.queue, async (msg) => {
            if (msg) {
                if (msg.properties.headers && msg.properties.headers['x-death'] && msg.properties.headers['x-death'].length > 0 && msg.properties.headers['x-death'][0].count > 3) {
                    console.log('Message has been retried more than 3 times, storing to investigate.');
                    this.channel.ack(msg);
                    this.channel.publish(this.config.logExchange, this.config.logQueue, msg.content);
                }
                else {
                    try {
                        const res = await this.handler(msg);
                        switch (res) {
                            case HandlerResponse.SUCCESS:
                                this.channel.ack(msg);
                                break;
                            case HandlerResponse.REJECT:
                                this.channel.ack(msg);
                                this.channel.publish(this.config.logExchange, this.config.logQueue, msg.content);
                                break;
                            case HandlerResponse.FAILURE:
                            default:
                                this.channel.reject(msg, false);
                                break;
                        }
                    }
                    catch (error) {
                        console.error('Error processing message:', error);
                        this.channel.reject(msg, false);
                    }
                }
            }
        });
    }
}
