/* eslint-disable @typescript-eslint/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type { ActionWithData, ResponseStatus } from '../types/index';

import { extractMemoContent } from '@atomone/chronostate';

declare module '@atomone/chronostate' {
    export namespace MemoExtractor {
        export interface TypeMap {
            'dither.Like': [string];
        }
    }
}

const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

export async function Like(action: ActionWithData): Promise<ResponseStatus> {
    try {
        const [post_hash] = extractMemoContent(action.memo, 'dither.Like');
        const postBody: Posts.LikeBody = {
            hash: action.hash,
            from: action.sender,
            post_hash: post_hash,
            timestamp: action.timestamp,
            quantity: action.quantity,
        };

        const rawResponse = await fetch(apiRoot + '/like', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postBody),
        });

        if (rawResponse.status !== 200) {
            console.error('Error posting to API:', rawResponse);
            return 'RETRY';
        }

        const response = await rawResponse.json() as { status: number; error?: string };
        if (response.status === 200) {
            console.log(`dither.Like message processed successfully: ${action.hash}`);
            return 'SUCCESS';
        }

        if (response.status === 500) {
            console.log(`dither.Like could not reach database: ${action.hash}`);
            return 'RETRY';
        }

        if (response.status === 400) {
            console.log(`dither.Like message skipped, invalid post hash provided: ${action.hash}`);
            return 'SKIP';
        }

        if (response.status === 404) {
            console.log(`dither.Like message skipped, invalid post provided: ${action.hash}`);
            return 'SKIP';
        }

        console.warn(`dither.Like message failed: ${action.hash} (${response.error})`);
        return 'RETRY';
    }
    catch (error) {
        console.error('Error processing message:', error);
        return 'RETRY';
    };
}
