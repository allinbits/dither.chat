import { Action } from '@atomone/chronostate/dist/types';

export type Message = { hash: string; from: string; message: string; timestamp: string; };
export type Post = Message & { replies: Message[] };

export type EventConfig = {
    exchange: string;
    durable: boolean;
    rabbitMQEndpoint: string;
}