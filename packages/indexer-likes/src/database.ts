import { MongoClient, Db, Collection } from 'mongodb';
import { useConfig } from './config';
import { Action } from '@atomone/chronostate/dist/types';
import { Vote, VoteRoot, VoteType } from './types';

const DATABASE_NAME = 'likes';
const config = useConfig();

let db: Db;
let likes: Collection;
let lastBlock: Collection;

export async function initDatabase() {
    const client = new MongoClient(config.MONGO_URI);
    await client.connect().catch((err) => {
        console.error(`Failed to connect to database, bad connection string?`);
        console.error(err);
        process.exit(1);
    });

    // Initialize database, and collections
    db = client.db(DATABASE_NAME);
    likes = db.collection('likes');
    lastBlock = db.collection('lastBlock');

    // Initialize last block insertion if it does not exist
    const result = await lastBlock.findOne<{ block: string }>({ id: 0 });
    if (!result) {
        await lastBlock.updateOne({ id: 0 }, { $set: { block: config.START_BLOCK } }, { upsert: true });
    }
}

export function useDatabase() {
    return {
        likes: {
            findOne: async (hash: string) => {
                return likes.findOne<VoteRoot>({ hash });
            },
            insert: async (actionData: Action, hash: string, voteType: VoteType) => {
                let voteRoot = await likes.findOne<VoteRoot>({ hash });
                const vote: Vote = {
                    amounts: actionData.amounts,
                    from: actionData.from,
                    hash: actionData.hash,
                    timestamp: actionData.timestamp,
                    type: voteType,
                };

                if (!voteRoot) {
                    voteRoot = {
                        hash,
                        votes: [vote],
                    };

                    return likes.insertOne(voteRoot);
                }

                if (voteRoot.votes.find((x) => x.hash === actionData.hash)) {
                    return;
                }

                voteRoot.votes.push(vote);
                return likes.updateOne({ hash: hash }, { $set: { votes: voteRoot.votes } }, { upsert: true });
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
