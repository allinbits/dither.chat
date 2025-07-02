import dotenv from 'dotenv';

dotenv.config();

type Config = {
    PORT: number;
    PG_URI: string;
    AUTH: string;
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

    config = {
        PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        PG_URI: process.env.PG_URI,
        AUTH: process.env.AUTH ?? 'default',
    };

    return config;
}
