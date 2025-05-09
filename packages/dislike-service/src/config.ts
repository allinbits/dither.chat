import type { EventConsumerConfig } from '@atomone/event-consumer';

let config: EventConsumerConfig;

export function useConfig(): EventConsumerConfig {
    if (typeof config !== 'undefined') {
        return config;
    }

    config = {
        exchange: process.env.RABBITMQ_EXCHANGE || 'dither',
        queue: process.env.RABBITMQ_QUEUE || '',
        dlxExchange: process.env.RABBITMQ_DLX_EXCHANGE || 'dither-dlx',
        dlxQueue: process.env.RABBITMQ_DLX_QUEUE || 'dlx-queue',
        logExchange: process.env.RABBITMQ_LOG_EXCHANGE || 'dither-log',
        logQueue: process.env.RABBITMQ_LOG_QUEUE || 'log-queue',
        durable: true,
        rabbitMQEndpoint: process.env.RABBITMQ_ENDPOINT || 'amqp://localhost',
    };

    return config;
}
