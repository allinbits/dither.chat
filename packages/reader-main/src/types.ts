export type Message = { hash: string; from: string; message: string; timestamp: string };
export type Post = Message & { replies: Message[] };
export type MsgTransfer = {
    '@type': string;
    'from_address': string;
    'to_address': string;
    'amount': Array<{ amount: string; denom: string }>;
};

export type MsgGeneric = {
    '@type': string;
    [key: string]: unknown;
};

export type EventConfig = {
    exchange: string;
    dlxExchange: string;
    logExchange: string;
    logQueue: string;
    dlxQueue: string;
    durable: boolean;
    rabbitMQEndpoint: string;
};
