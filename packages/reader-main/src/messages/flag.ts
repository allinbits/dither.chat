/* eslint-disable @typescript-eslint/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type { ActionWithData, ResponseStatus } from '../types/index';

import { extractMemoContent } from '@atomone/chronostate';

import { useConfig } from '../config';

declare module '@atomone/chronostate' {
    export namespace MemoExtractor {
        export interface TypeMap {
            'dither.Flag': [string];
        }
    }
}

const { AUTH } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

export async function Flag(action: ActionWithData): Promise<ResponseStatus> {
    try {
        const [post_hash] = extractMemoContent(action.memo, 'dither.Flag');
        const postBody: Posts.FlagBody = {
            hash: action.hash,
            from: action.sender,
            post_hash: post_hash,
            timestamp: action.timestamp,
            quantity: action.quantity,
        };

        const rawResponse = await fetch(apiRoot + '/flag', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': AUTH,
            },
            body: JSON.stringify(postBody),
        });

        if (rawResponse.status !== 200) {
            console.error('Error posting to API:', rawResponse);
            return 'RETRY';
        }

        const response = await rawResponse.json() as { status: number; error?: string };
        if (response.status === 200) {
            console.log(`dither.Flag message processed successfully: ${action.hash}`);
            return 'SUCCESS';
        }

        if (response.status === 500) {
            console.log(`dither.Flag could not reach database: ${action.hash}`);
            return 'RETRY';
        }

        if (response.status === 400) {
            console.log(`dither.Flag message skipped, invalid post hash provided: ${action.hash}`);
            return 'SKIP';
        }

        if (response.status === 404) {
            console.log(`dither.Flag message skipped, invalid post provided: ${action.hash}`);
            return 'SKIP';
        }

        console.warn(`dither.Flag message failed: ${action.hash} (${response.error})`);
        return 'RETRY';
    }
    catch (error) {
        console.error('Error processing message:', error);
        return 'RETRY';
    };
}
