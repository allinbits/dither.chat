import type { Action } from '@atomone/chronostate/dist/types';

import { ChronoState } from '@atomone/chronostate';

import { useConfig } from './config';

const config = useConfig();

let state: ChronoState;
let _lastBlock: string;

async function handleAction(action: Action) {
  if (action.memo.startsWith('dither.Post')) {
    //
  }

  if (action.memo.startsWith('dither.Reply')) {
    //
  }
}

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
function handleLastBlock(block: string | String) {
  // db.lastBlock.update(block as string);
  // Need to switch this out to store last block somewhere, otherwise rely on
  console.log(`Updated Block | ${block}`);
}

export async function start() {
  // lastBlock = await db.lastBlock.select();
  // state = new ChronoState({ ...config, START_BLOCK: lastBlock });
  state = new ChronoState({ ...config });
  state.onLastBlock(handleLastBlock);
  state.onAction(handleAction);
  state.start();
}

start();
