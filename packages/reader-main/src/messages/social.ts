/* eslint-disable ts/no-namespace */
import type { ActionWithData, ResponseStatus } from '../types/index';

import process from 'node:process';

import { extractMemoContent } from '@atomone/chronostate';

import { useConfig } from '../config/index';

declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap {
      'dither.LinkSocial': [string, string, string];
    }
  }
}

const { AUTH } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000/v1';

export async function LinkSocial(action: ActionWithData): Promise<ResponseStatus> {
  try {
    const [username, platform, proofUrl] = extractMemoContent(action.memo, 'dither.LinkSocial');
    const postBody: { hash: string; from: string; username: string; platform: string; proof_url: string; timestamp: string } = {
      hash: action.hash,
      from: action.sender,
      username,
      platform,
      proof_url: proofUrl,
      timestamp: action.timestamp,
    };

    const rawResponse = await fetch(`${apiRoot}/social/proof`, {
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
      console.log(`dither.LinkSocial message processed successfully: ${action.hash}`);
      return 'SUCCESS';
    }

    if (response.status === 500) {
      console.log(`dither.LinkSocial could not reach database: ${action.hash}`);
      return 'RETRY';
    }

    if (response.status === 400) {
      console.log(`dither.LinkSocial message skipped, ${response.error} | Hash: ${action.hash}`);
      return 'SKIP';
    }

    console.warn(`dither.LinkSocial failed: ${response.error} | Hash: ${action.hash}`);
    return 'RETRY';
  } catch (error) {
    console.error('Error processing message:', error);
    return 'RETRY';
  };
}
