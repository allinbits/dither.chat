import { Action } from "@atomone/chronostate/dist/types";

export type Message = { hash: string, from: string, message: string, timestamp: string, amounts: Action['amounts'] };
export type Post = Message & { replies: Message[] }
