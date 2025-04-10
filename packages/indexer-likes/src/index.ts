import { ChronoState } from '@atomone/chronostate';
import { useConfig } from './config';
import { initDatabase, useDatabase } from './database';
import { Action } from '@atomone/chronostate/dist/types';

const config = useConfig();
const db = useDatabase();

let state: ChronoState;
let lastBlock: string;
let lastAction: Action;

async function handleAction(action: Action) {
    if (lastAction && lastAction.hash === action.hash) {
        return;
    }

    const result = await db.action.findOne(action.hash);
    if (result) {
        return;
    }

    try {
        await db.action.insert(action);
    } catch (err) {
        console.error(err);
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
