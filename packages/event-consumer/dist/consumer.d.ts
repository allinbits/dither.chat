import amqplib from 'amqplib';
import { EventConsumerConfig } from './types';
export declare class EventConsumer {
    private channel;
    private config;
    private handler;
    constructor(config: EventConsumerConfig, handler: (msg: amqplib.Message) => Promise<boolean>);
    connect(): Promise<void>;
    consume(): Promise<void>;
}
