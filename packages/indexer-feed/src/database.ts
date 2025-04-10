import { MongoClient, Db, Collection } from 'mongodb';
import { useConfig } from './config';
import { Action } from '@atomone/chronostate/dist/types';
import { Message, Post } from './types';

const config = useConfig();

let db: Db;
let lastBlock: Collection;
let posts: Collection;

export async function initDatabase() {
    const client = new MongoClient(config.MONGO_URI);
    await client.connect().catch((err) => {
        console.error(`Failed to connect to database, bad connection string?`);
        console.error(err);
        process.exit(1);
    });

    // Initialize database, and collections
    db = client.db('feed');
    lastBlock = db.collection('lastBlock');
    posts = db.collection('posts');

    // Initialize last block insertion if it does not exist
    const result = await lastBlock.findOne<{ block: string }>({ id: 0 });
    if (!result) {
        await lastBlock.updateOne({ id: 0 }, { $set: { block: config.START_BLOCK } }, { upsert: true });
    }
}

export function useDatabase() {
    return {
        posts: {
            findOne: async (hash: string) => {
                return posts.findOne({ hash });
            },
            insert: async (actionData: Action, msg: string) => {
                const post: Post = {
                    message: msg,
                    from: actionData.from,
                    amounts: actionData.amounts,
                    hash: actionData.hash,
                    timestamp: actionData.timestamp,
                    replies: [],
                };

                return posts.insertOne(post);
            },
        },
        replies: {
            insert: async (actionData: Action, hash: string, msg: string) => {
                const post = await posts.findOne<Post>({ hash });
                if (!post) {
                    return;
                }

                const reply: Message = {
                    message: msg,
                    from: actionData.from,
                    amounts: actionData.amounts,
                    hash: actionData.hash,
                    timestamp: actionData.timestamp,
                };

                post.replies.push(reply);
                return posts.updateOne({ hash: post.hash }, { $set: { replies: post.replies } }, { upsert: true });
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
