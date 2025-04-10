import { MongoClient, Db, Collection } from 'mongodb';
import { useConfig } from './config';

const DATABASE_NAME = 'likes';
const config = useConfig();

let db: Db;
let likes: Collection;

export async function initDatabase() {
    const client = new MongoClient(config.MONGO_URI);
    await client.connect().catch((err) => {
        console.error(`Failed to connect to database, bad connection string?`);
        console.error(err);
        process.exit(1);
    });

    db = client.db(DATABASE_NAME);
    likes = db.collection('likes');
}

export function useDatabase() {
    return {
        likes: {
            findOne: async (hash: string) => {
                return likes.findOne({ hash });
            }
        },
    };
}
