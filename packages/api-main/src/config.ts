import crypto from 'node:crypto';

import dotenv from 'dotenv';

dotenv.config();

type JWT_STRICTNESS = boolean | 'lax' | 'strict' | 'none' | undefined;

export type Config = {
    PORT: number;
    PG_URI: string;
    AUTH: string;
    JWT: string;
    JWT_STRICTNESS: JWT_STRICTNESS;
    DISCORD_WEBHOOK_URL: string;
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: string | undefined;
    OTEL_EXPORTER_OTLP_HEADERS: string | undefined;
};

let config: Config;

export function useConfig(): Config {
    if (typeof config !== 'undefined') {
        return config;
    }

    if (typeof process.env.PG_URI === 'undefined') {
        console.error(`Failed to specify PG_URI, no database uri provided`);
        process.exit(1);
    }

    if (!process.env.AUTH || process.env.AUTH === 'default') {
        throw new Error(`AUTH must be set to a strong secret`);
    }

    if (!process.env.JWT) {
        console.log(`JWT was not set, defaulting to a randomized byte hex string.`);
        process.env.JWT = crypto.randomBytes(128).toString('hex');
    }

    if (typeof process.env.JWT_STRICTNESS === 'undefined') {
        console.warn(`JWT_STRICTNESS not set, defaulting to lax`);
        process.env.JWT_STRICTNESS = 'lax';
    }

    if (typeof process.env.DISCORD_WEBHOOK_URL === 'undefined') {
        console.warn(`DISCORD_WEBHOOK_URL not set, defaulting to empty`);
        process.env.DISCORD_WEBHOOK_URL = '';
    }

    if (typeof process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT === 'undefined') {
        console.warn(`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT not set, defaulting to empty`);
    }

    config = {
        PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        PG_URI: process.env.PG_URI,
        AUTH: process.env.AUTH ?? 'default',
        JWT: process.env.JWT ?? 'default-secret-key',
        JWT_STRICTNESS: process.env.JWT_STRICTNESS as JWT_STRICTNESS,
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
        OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    };

    return config;
}
