import type { Action } from '@atomone/chronostate';

export type ActionWithData = Action & { quantity: string; sender: string };

export type ResponseStatus = 'FAILURE' | 'SUCCESS' | 'RETRY' | 'SKIP';
