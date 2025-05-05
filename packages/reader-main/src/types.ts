import type { Action } from '@atomone/chronostate/dist/types';

export type Message = { hash: string; from: string; message: string; timestamp: string; };
export type Post = Message & { replies: Message[] };
export type MsgTransfer = {
    '@type': string;
    from_address: string;
    to_address: string;
    amount: Array<{ amount: string; denom: string }>;
};

export type MsgGeneric = { 
    '@type': string;
    [key: string]: any;
};

export type EventConfig = {
    exchange: string;
    durable: boolean;
    rabbitMQEndpoint: string;
}