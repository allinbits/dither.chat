import dotenv from 'dotenv';

dotenv.config();

type Config = {
    READ_ONLY_PORT: number;
    WRITE_ONLY_PORT: number;
    PG_URI: string;
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

    config = {
        READ_ONLY_PORT: process.env.READ_ONLY_PORT ? parseInt(process.env.READ_ONLY_PORT) : 3000,
        WRITE_ONLY_PORT: process.env.WRITE_ONLY_PORT ? parseInt(process.env.WRITE_ONLY_PORT) : 3001,
        PG_URI: process.env.PG_URI,
    };

    return config;
}
