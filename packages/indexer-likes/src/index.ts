import { ChronoState, extractMemoContent } from '@atomone/chronostate';
import { useConfig } from './config';
import { initDatabase, useDatabase } from './database';
import { Action } from '@atomone/chronostate/dist/types';
import { VoteType } from './types';

const config = useConfig();
const db = useDatabase();

let state: ChronoState;
let lastBlock: string;
let lastAction: Action;

async function handleVote(action: Action) {
    const [txHash, voteType] = extractMemoContent(action.memo, 'dither.Vote');

    if (!txHash) {
        console.warn(`Failed to process ${action.hash}, malformed vote, no tx hash`);
        return;
    }

    if (!voteType) {
        console.warn(`Failed to process ${action.hash}, malformed vote, no vote type`);
        return;
    }

    const castedVoteType = voteType as VoteType;
    if (castedVoteType !== 'DISLIKE' && castedVoteType !== 'FLAG' && castedVoteType !== 'LIKE') {
        console.warn(`Failed to process ${action.hash}, malformed vote, invalid vote type`);
        return;
    }

    try {
        await db.likes.insert(action, txHash, castedVoteType);
    } catch (err) {
        console.error(err);
    }
}

async function handleAction(action: Action) {
    if (lastAction && lastAction.hash === action.hash) {
        return;
    }

    const result = await db.likes.findOne(action.hash);
    if (result) {
        return;
    }

    if (action.memo.startsWith('dither.Vote')) {
        handleVote(action);
    }

    lastAction = action;
}

function handleLastBlock(block: string | String) {
    db.lastBlock.update(block as string);
    console.log(`Updated Block | ${block}`);
}

export async function start() {
    await initDatabase();

    lastBlock = await db.lastBlock.select();
    state = new ChronoState({ ...config, START_BLOCK: lastBlock });
    state.onLastBlock(handleLastBlock);
    state.onAction(handleAction);
    state.start();
}

start();
