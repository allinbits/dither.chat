/* eslint-disable ts/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type { ActionWithData, ResponseStatus } from '../types/index';
import process from 'node:process';
import { extractMemoContent } from '@atomone/chronostate';

import { useConfig } from '../config/index';

declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap {
      'dither.Post': [string];
    }
  }
}

const { AUTH } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000/v1';

export async function Post(action: ActionWithData): Promise<ResponseStatus> {
  try {
    const [message] = extractMemoContent(action.memo, 'dither.Post');
    const postBody: Posts.PostBody = {
      hash: action.hash,
      from: action.sender,
      msg: message,
      timestamp: action.timestamp,
      quantity: action.quantity,
    };

    const rawResponse = await fetch(`${apiRoot}/post`, {
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
      console.log(`dither.Post message processed successfully: ${action.hash}`);
      return 'SUCCESS';
    }

    if (response.status === 500) {
      console.log(`dither.Post could not reach database: ${action.hash}`);
      return 'RETRY';
    }

    if (response.status === 400) {
      console.log(`dither.Post message skipped, invalid parameters provided: ${action.hash}`);
      return 'SKIP';
    }

    if (response.status === 404) {
      console.log(`dither.Post message skipped, invalid post provided: ${action.hash}`);
      return 'SKIP';
    }

    console.warn(`dither.Post message failed to post: ${action.hash} (${response.error})`);
    return 'RETRY';
  } catch (error) {
    console.error('Error processing message:', error);
    return 'RETRY';
  };
}
