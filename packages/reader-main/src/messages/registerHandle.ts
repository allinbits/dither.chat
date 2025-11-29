/* eslint-disable ts/no-namespace */
import type { Posts } from '@atomone/dither-api-types';

import type { ActionWithData, ResponseStatus } from '../types/index';

import process from 'node:process';

import { extractMemoContent } from '@atomone/chronostate';
import { Decimal } from '@cosmjs/math';

import { useConfig } from '../config/index';

declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap {
      'dither.RegisterHandle': [string];
    }
  }
}

const { AUTH, MIN_REGISTER_HANDLE_FEE } = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000/v1';
const fractionalDigits = 6;
const minAmount = Decimal.fromUserInput(MIN_REGISTER_HANDLE_FEE, fractionalDigits);

export async function RegisterHandle(action: ActionWithData): Promise<ResponseStatus> {
  // Check that the minimum required amount has been sent
  const sendAmount = Decimal.fromAtomics(action.quantity, fractionalDigits);
  if (sendAmount.isLessThan(minAmount)) {
    console.log(`dither.RegisterHandle message skipped, requires at least ${MIN_REGISTER_HANDLE_FEE} PHOTON`);
    return 'SKIP';
  }

  try {
    const [handle] = extractMemoContent(action.memo, 'dither.RegisterHandle');
    const postBody: Posts.RegisterHandleBody = {
      hash: action.hash,
      address: action.sender,
      handle,
      timestamp: action.timestamp,
    };

    const rawResponse = await fetch(`${apiRoot}/register-handle`, {
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
      console.log(`dither.RegisterHandle message processed successfully: ${action.hash}`);
      return 'SUCCESS';
    }

    if (response.status === 500) {
      console.log(`dither.RegisterHandle could not reach database: ${action.hash}`);
      return 'RETRY';
    }

    if (response.status === 401) {
      console.log(`dither.RegisterHandle message skipped, invalid address provided: ${action.hash}`);
      return 'SKIP';
    }

    console.warn(`dither.RegisterHandle failed: ${action.hash} (${response.error})`);
    return 'RETRY';
  } catch (error) {
    console.error('Error processing message:', error);
    return 'RETRY';
  };
}
