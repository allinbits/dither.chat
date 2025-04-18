import { MongoClient, Db, Collection } from 'mongodb';
import { useConfig } from './config';

const DATABASE_NAME = 'feed';
const config = useConfig();

let db: Db;
let posts: Collection;

export async function initDatabase() {
    // const client = new MongoClient(config.MONGO_URI);
    // await client.connect().catch((err) => {
    //     console.error(`Failed to connect to database, bad connection string?`);
    //     console.error(err);
    //     process.exit(1);
    // });

    // db = client.db(DATABASE_NAME);
    // posts = db.collection('posts');
}

export function useDatabase() {
    return {
        // posts: {
        //     findOne: async (hash: string) => {
        //         return posts.findOne({ hash });
        //     },
        //     findByAuthor: async(author: string, page: number, limit: number = 100) => {
        //         const skip = page * limit;
        //         const cursor = posts.find({ from: author }).skip(skip).limit(limit).sort({ _id: -1 });

        //         const results = await cursor.toArray();
        //         const total = await posts.countDocuments();
                
        //         return {
        //             page,
        //             limit,
        //             total,
        //             pages: Math.ceil(total / limit),
        //             results,
        //         };
        //     },
        //     findPaginated: async (page: number, limit: number = 100) => {
        //         const skip = page * limit;
        //         const cursor = posts.find({}).skip(skip).limit(limit).sort({ _id: -1 });

        //         const results = await cursor.toArray();
        //         const total = await posts.countDocuments();

        //         return {
        //             page,
        //             limit,
        //             total,
        //             pages: Math.ceil(total / limit),
        //             results,
        //         };
        //     },
        // },
    };
}
