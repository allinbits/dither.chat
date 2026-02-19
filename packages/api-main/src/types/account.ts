import type { InferSelectModel } from 'drizzle-orm';

import type { AccountTable } from '../../drizzle/schema';

export type Account = InferSelectModel<typeof AccountTable>;
