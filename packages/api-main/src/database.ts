import { useConfig } from './config';
import { drizzle } from 'drizzle-orm/node-postgres';


const DATABASE_NAME = 'feed';
const config = useConfig();
const db = drizzle(config.PG_URI);

export async function initDatabase() {
    //
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
