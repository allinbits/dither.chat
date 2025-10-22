/* eslint-disable ts/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type { ActionWithData, ResponseStatus } from '../types/index';
import process from 'node:process';
import { extractMemoContent } from '@atomone/chronostate';

import { useConfig } from '../config/index';

declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap {
      'dither.Follow': [string];
    }
  }
}

const { AUTH } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000/v1';

export async function Follow(action: ActionWithData): Promise<ResponseStatus> {
  try {
    const [following_address] = extractMemoContent(action.memo, 'dither.Follow');
    const postBody: Posts.FollowBody = {
      hash: action.hash,
      from: action.sender,
      address: following_address,
      timestamp: action.timestamp,
    };

    const rawResponse = await fetch(`${apiRoot}/follow`, {
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
  } catch (error) {
    console.error('Error processing message:', error);
    return 'RETRY';
  };
}
