export type EventConsumerConfig = {
    exchange: string;
    dlxExchange: string;
    logExchange: string;
    dlxQueue: string;
    logQueue: string;
    queue: string;
    durable: boolean;
    rabbitMQEndpoint: string;
};
