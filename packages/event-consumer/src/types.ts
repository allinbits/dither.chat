export type EventConsumerConfig = {
    exchange: string;
    dlxExchange: string;
    dlxQueue: string;
    queue: string;
    durable: boolean;
    rabbitMQEndpoint: string;
};
