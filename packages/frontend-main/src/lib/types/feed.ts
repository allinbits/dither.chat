import { FeedTable } from 'api-main/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const basePostSchema = createSelectSchema(FeedTable);

// Overrides
export const postSchema = basePostSchema.extend({
    // Force ISO format
    timestamp: z.string(),
});

export type Post = z.infer<typeof postSchema>;
