import { ChronoState, extractMemoContent } from '@atomone/chronostate';
import { useConfig } from './config';
import { initDatabase, useDatabase } from './database';
import { Action } from '@atomone/chronostate/dist/types';

const config = useConfig();
const db = useDatabase();

let state: ChronoState;
let lastBlock: string;
let lastAction: Action;

async function handlePost(action: Action) {
    const [msg] = extractMemoContent(action.memo, 'dither.Post');

    if (!msg) {
        console.warn(`Failed to process ${action.hash}, malformed post`);
        return;
    }

    try {
        await db.posts.insert(action, msg);
    } catch (err) {
        console.error(err);
    }
}

async function handleReply(action: Action) {
    const [hash, msg] = extractMemoContent(action.memo, 'dither.Reply');

    if (!hash) {
        console.warn(`Failed to process ${action.hash}, malformed reply`);
        return;
    }

    if (!msg) {
        console.warn(`Failed to process ${action.hash}, malformed msg`);
        return;
    }

    try {
        await db.replies.insert(action, hash, msg);
    } catch (err) {
        console.error(err);
    }
}

async function handleAction(action: Action) {
    if (lastAction && lastAction.hash === action.hash) {
        return;
    }

    if (action.memo.startsWith('dither.Post')) {
        handlePost(action);
    }

    if (action.memo.startsWith('dither.Reply')) {
        handleReply(action);
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
