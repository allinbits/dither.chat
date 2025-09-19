import type { Config } from '@atomone/chronostate/dist/types';

let config: Config & {
    AUTH: string,
    ECLESIA_GRAPHQL_ENDPOINT?: string
    ECLESIA_GRAPHQL_SECRET?: string
};

export function useConfig(): typeof config {
    if (typeof config !== 'undefined') {
        return config;
    }

    if (typeof process.env.AUTH === 'undefined') {
        console.warn(`AUTH env variable is set to default, ensure you provide an authorization key for reader communication`);
    }

    config = {
        API_URLS: process.env.API_URLS ? process.env.API_URLS.split(',') : [],
        MEMO_PREFIX: process.env.MEMO_PREFIX,
        BATCH_SIZE: process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : 50,
        START_BLOCK: process.env.START_BLOCK ?? '',
        RECEIVER: process.env.RECEIVER,
        SENDER: process.env.SENDER,
        LOG: process.env.LOG === 'true',
        AUTH: process.env.AUTH ?? 'default',
        
        ECLESIA_GRAPHQL_ENDPOINT: process.env.ECLESIA_GRAPHQL_ENDPOINT,
        ECLESIA_GRAPHQL_SECRET: process.env.ECLESIA_GRAPHQL_SECRET,
    };

    return config;
}
