import dotenv from 'dotenv';

dotenv.config();

type JWT_STRICTNESS = boolean | 'lax' | 'strict' | 'none' | undefined;

type Config = {
    PORT: number;
    PG_URI: string;
    AUTH: string;
    JWT: string;
    JWT_STRICTNESS: JWT_STRICTNESS;
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

    if (typeof process.env.AUTH === 'undefined') {
        console.warn(`AUTH env variable is set to default, ensure you provide an authorization key for reader communication`);
    }

    if (typeof process.env.JWT === 'undefined') {
        console.warn(`JWT env variable is seto to default`);
    }

    if (typeof process.env.JWT_STRICTNESS === 'undefined') {
        console.warn(`JWT_STRICTNESS not set correctly, either set to 'lax' or 'strict'`);
        process.env.JWT_STRICTNESS = 'lax';
    }

    config = {
        PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        PG_URI: process.env.PG_URI,
        AUTH: process.env.AUTH ?? 'default',
        JWT: process.env.JWT ?? 'default-secret-key',
        JWT_STRICTNESS: process.env.JWT_STRICTNESS as JWT_STRICTNESS,
    };

    return config;
}
