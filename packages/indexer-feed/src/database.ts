import { MongoClient, Db, Collection } from 'mongodb';
import { useConfig } from './config';

const config = useConfig();

let db: Db;
let actions: Collection;
let lastBlock: Collection;

export async function initDatabase() {
    const client = new MongoClient(config.MONGO_URI);
    await client.connect().catch((err) => {
        console.error(`Failed to connect to database, bad connection string?`);
        console.error(err);
        process.exit(1);
    });

    // Initialize database, and collections
    db = client.db('data');
    actions = db.collection('actions');
    lastBlock = db.collection('lastBlock');

    // Initialize last block insertion if it does not exist
    const result = await lastBlock.findOne<{ block: string }>({ id: 0 });
    if (!result) {
        await lastBlock.updateOne({ id: 0 }, { $set: { block: config.START_BLOCK } }, { upsert: true });
    }
}

export function useDatabase() {
    return {
        action: {
            findOne: async (hash: string) => {
                return actions.findOne({ hash });
            },
            insert: async (actionData: any) => {
                return actions.insertOne(actionData);
            },
        },
        lastBlock: {
            select: async () => {
                const result = await lastBlock.findOne<{ block: string }>({ id: 0 });
                if (!result) {
                    return config.START_BLOCK;
                }

                return result.block;
            },
            update: async (newBlock: string) => {
                return lastBlock.updateOne({ id: 0 }, { $set: { block: newBlock } }, { upsert: true });
            },
        },
    };
}
