import type { EventConfig } from './types';

let config: EventConfig;

export function useEventConfig(): EventConfig {
    if (typeof config !== 'undefined') {
        return config;
    }

    config = {
        exchange: process.env.RABBITMQ_EXCHANGE || 'dither',
        durable: true,
        rabbitMQEndpoint: process.env.RABBITMQ_ENDPOINT || 'amqp://localhost',
    };

    return config;
}
