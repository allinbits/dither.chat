import type { EventConsumerConfig } from '@atomone/event-consumer';

let config: EventConsumerConfig;

export function useConfig(): EventConsumerConfig {
    if (typeof config !== 'undefined') {
        return config;
    }

    config = {
        exchange: process.env.RABBITMQ_EXCHANGE || 'dither-dlx',
        queue: 'dlx-queue',
        durable: true,
        rabbitMQEndpoint: process.env.RABBITMQ_ENDPOINT || 'amqp://localhost',
    };

    return config;
}
