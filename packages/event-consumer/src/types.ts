export type EventConsumerConfig = {
    exchange: string;
    queue: string;
    durable: boolean;
    rabbitMQEndpoint: string;
};
