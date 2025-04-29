import type { EventConsumerConfig } from "@atomone/event-consumer";


let config: EventConsumerConfig;

export function useConfig(): EventConsumerConfig {
    if (typeof config !== 'undefined') {
        return config;
    }

    config = {
        exchange: process.env.RABBITMQ_EXCHANGE || 'dither',
        queue: 'Reply',
        durable: true,
        rabbitMQEndpoint: process.env.RABBITMQ_ENDPOINT || 'amqp://localhost',
    };

    return config;
}
