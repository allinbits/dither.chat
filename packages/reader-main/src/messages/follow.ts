/* eslint-disable @typescript-eslint/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type { ActionWithData, ResponseStatus } from '../types/index';

import { extractMemoContent } from '@atomone/chronostate';

declare module '@atomone/chronostate' {
    export namespace MemoExtractor {
        export interface TypeMap {
            'dither.Follow': [string];
        }
    }
}

const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

export async function Follow(action: ActionWithData): Promise<ResponseStatus> {
    try {
        const [following_address] = extractMemoContent(action.memo, 'dither.Follow');
        const postBody: Posts.FollowBody = {
            hash: action.hash,
            from: action.sender,
            address: following_address,
            timestamp: action.timestamp,
        };

        const rawResponse = await fetch(apiRoot + '/follow', {
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
            console.log(`dither.Follow message processed successfully: ${action.hash}`);
            return 'SUCCESS';
        }

        if (response.status === 500) {
            console.log(`dither.Follow could not reach database: ${action.hash}`);
            return 'RETRY';
        }

        if (response.status === 400) {
            console.log(`dither.Follow message skipped, ${response.error} | Hash: ${action.hash}`);
            return 'SKIP';
        }

        console.warn(`dither.Follow failed: ${response.error} | Hash: ${action.hash}`);
        return 'RETRY';
    }
    catch (error) {
        console.error('Error processing message:', error);
        return 'RETRY';
    };
}
