import type { getDatabase } from '../../drizzle/db';

export interface MsgTransfer {
  '@type': string;
  'from_address': string;
  'to_address': string;
  'amount': Array<{ amount: string; denom: string }>;
}

export interface MsgGeneric { [key: string]: unknown }

export type TransactionFunction = (tx: ReturnType<typeof getDatabase>) => Promise<void>;
