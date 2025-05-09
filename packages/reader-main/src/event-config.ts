import type { EventConfig } from './types';

let config: EventConfig;

export function useEventConfig(): EventConfig {
    if (typeof config !== 'undefined') {
        return config;
    }

    config = {
        exchange: process.env.RABBITMQ_EXCHANGE || 'dither',
        dlxExchange: process.env.RABBITMQ_DLX_EXCHANGE || 'dither-dlx',
        dlxQueue: process.env.RABBITMQ_DLX_QUEUE || 'dlx-queue',
        durable: true,
        rabbitMQEndpoint: process.env.RABBITMQ_ENDPOINT || 'amqp://localhost',
    };

    return config;
}
