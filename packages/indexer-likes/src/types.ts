import { Action } from "@atomone/chronostate/dist/types";

export type VoteType = 'LIKE' | 'DISLIKE' | 'FLAG';
export type Vote = { hash: string, from: string, timestamp: string, amounts: Action['amounts'], type: VoteType };
export type VoteRoot = { hash: string, votes: Vote[] };
