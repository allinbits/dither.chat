export interface Message { hash: string; from: string; message: string; timestamp: string }
export type Post = Message & { replies: Message[] };
export interface MsgTransfer {
  '@type': string;
  'from_address': string;
  'to_address': string;
  'amount': Array<{ amount: string; denom: string }>;
}

export interface MsgGeneric {
  '@type': string;
  [key: string]: unknown;
}
