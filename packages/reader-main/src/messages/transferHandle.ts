/* eslint-disable ts/no-namespace */
import type { Posts } from '@atomone/dither-api-types';

import type { ActionWithData, ResponseStatus } from '../types/index';

import process from 'node:process';

import { extractMemoContent } from '@atomone/chronostate';

import { useConfig } from '../config/index';

declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap {
      'dither.TransferHandle': [string, string];
    }
  }
}

const { AUTH } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000/v1';

export async function TransferHandle(action: ActionWithData): Promise<ResponseStatus> {
  try {
    const [handle, to_address] = extractMemoContent(action.memo, 'dither.TransferHandle');
    const postBody: Posts.TransferHandleBody = {
      hash: action.hash,
      from_address: action.sender,
      to_address,
      handle,
      timestamp: action.timestamp,
    };

    const rawResponse = await fetch(`${apiRoot}/transfer-handle`, {
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
      console.log(`dither.TransferHandle message processed successfully: ${action.hash}`);
      return 'SUCCESS';
    }

    if (response.status === 500) {
      console.log(`dither.TransferHandle could not reach database: ${action.hash}`);
      return 'RETRY';
    }

    if (response.status === 401) {
      console.log(`dither.TransferHandle message skipped, invalid address provided: ${action.hash}`);
      return 'SKIP';
    }

    console.warn(`dither.TransferHandle failed: ${action.hash} (${response.error})`);
    return 'RETRY';
  } catch (error) {
    console.error('Error processing message:', error);
    return 'RETRY';
  };
}
