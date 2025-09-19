import type { Action } from '@atomone/chronostate/dist/types';
import type { MsgGeneric, MsgTransfer } from './types';
import type { ResponseStatus } from './types/index';

import { ChronoState } from '@atomone/chronostate';

import { EclesiaClient } from './eclesia/client';
import { useConfig } from './config/index';
import { MessageHandlers } from './messages/index';
import { useQueue } from './queue';

const config = useConfig();
const queue = useQueue();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';
const msCheckpointTime = 1_000;
const actionTypes = ['Post', 'Reply', 'Like', 'Flag', 'Dislike', 'Follow', 'Unfollow', 'Remove'];

let state: ChronoState;
let lastHash: string;
let isProcessing = false;
let lastActionProcessed = Date.now();
let isUpdating = false;

export function getTransferMessage(messages: Array<MsgGeneric>) {
    const msgTransfer = messages.find(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');
    if (!msgTransfer) {
        return null;
    }

    return msgTransfer as MsgTransfer;
}

export function getTransferQuantities(messages: Array<MsgGeneric>, denom = 'uphoton') {
    const msgTransfers = messages.filter(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend') as MsgTransfer[];
    let amount = BigInt('0');

    for (const msg of msgTransfers) {
        for (const quantity of msg.amount) {
            if (quantity.denom !== denom) {
                continue;
            }

            amount += BigInt(quantity.amount);
        }
    }

    return amount.toString();
}

async function handleAction(action: Action) {
    if (lastHash === action.hash) {
        return;
    }

    lastHash = action.hash;
    queue.add(action);
}

async function handleLastBlock(block: string) {
    if (isUpdating) {
        return;
    }

    isUpdating = true;

    if (lastActionProcessed + msCheckpointTime < Date.now() && queue.size() <= 0) {
        lastActionProcessed = Date.now();
        const didUpdate = await updateLastBlock(block);
        if (!didUpdate) {
            console.warn(`Failed to update last block: ${block}`);
            isUpdating = false;
            return;
        }
    }

    if (queue.size() >= 1) {
        console.log(`Updated | Block: ${block} | Queue Size: ${queue.size()} | Retry Count: ${queue.getRetryCount()}`);
    }

    isUpdating = false;
}

async function processAction(action: Action): Promise<ResponseStatus> {
    for (const actionType of actionTypes) {
        if (!action.memo.startsWith(config.MEMO_PREFIX + actionType)) {
            continue;
        }

        const actionTypeKey = actionType as keyof typeof MessageHandlers;
        if (!MessageHandlers[actionTypeKey]) {
            console.warn(`No message handler registered for ${actionType}`);
            return 'SKIP';
        }

        const transfer = getTransferMessage(action.messages as Array<MsgGeneric>);
        const quantity = getTransferQuantities(action.messages as Array<MsgGeneric>);
        if (!transfer) {
            console.warn(`No transfer provided, skipping. ${actionType}`);
            return 'SKIP';
        }

        return await MessageHandlers[actionTypeKey]({ ...action, sender: transfer.from_address, quantity });
    }

    console.warn(`Skipped ${action.hash}, not a valid dither protocol message`);
    return 'SKIP';
}

async function updateLastBlock(height: string, attempt = 0) {
    const rawResponse = await fetch(apiRoot + '/update-state', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': config.AUTH,
        },
        body: JSON.stringify({ last_block: height }),
    });

    if (attempt >= 3) {
        console.warn(`Failed to update state 3 times for ${attempt}`);
        return false;
    }

    if (rawResponse.status !== 200) {
        console.warn(`Update state failed, trying again.`);
        console.info(rawResponse);
        await new Promise(resolve => setTimeout(resolve, attempt * 1_000));
        return updateLastBlock(height, attempt + 1);
    }

    const response = await rawResponse.json() as { status: number; error?: string };
    if (response.status === 500) {
        console.warn(`Update state failed, trying again.`);
        console.info(rawResponse);
        await new Promise(resolve => setTimeout(resolve, attempt * 1_000));
        return updateLastBlock(height, attempt + 1);
    }

    console.log(`Updated Block Checkpoint | ${height}`);
    return true;
}

async function handleQueue() {
    if (!queue.hasElements() || isProcessing) {
        return;
    }

    // Process Action
    isProcessing = true;
    const action = queue.peek();
    const response = await processAction(action);

    // Success OR explicitly skip
    if (response === 'SUCCESS' || response === 'SKIP') {
        queue.remove();

        const didUpdate = await updateLastBlock(action.height);
        if (!didUpdate) {
            throw new Error(`Failed to update last block: ${action.height}`);
        }

        lastActionProcessed = Date.now();
        isProcessing = false;
        return;
    }

    // Failure OR exceeded retry count
    if (response === 'FAILURE' || queue.getRetryCount() >= 4) {
        queue.remove();
        isProcessing = false;
        return;
    }

    // Retry
    queue.addRetryCount();
    await new Promise((resolve) => {
        setTimeout(resolve, queue.getBackoffPolicy());
    });

    isProcessing = false;
}

async function getLastBlock() {
    const rawResponse = await fetch(apiRoot + '/last-block');

    if (rawResponse.status !== 200) {
        console.warn(`Block Height Not Stored, Starting from ${config.START_BLOCK}`);
        return null;
    }

    const response = await rawResponse.json() as { status: number; rows: { last_block: string }[] };
    if (response.status === 404) {
        console.warn(`Block Height Not Stored, Starting from ${config.START_BLOCK}`);
        return null;
    }

    return response.rows[0].last_block;
}

export async function start() {
    console.info('Starting Application');

    let startBlock = 0;

    let lastBlockStored = parseInt(await getLastBlock() ?? '0');
    console.info(`Last Block: `, lastBlockStored);

    if (parseInt(config.START_BLOCK) > lastBlockStored) {
        console.info(`START_BLOCK is higher than last block stored, starting from START_BLOCK=${config.START_BLOCK}`);
        config.START_BLOCK = lastBlockStored.toString();
    } else {
        startBlock = lastBlockStored;
    }

    const isFastSync = (config.ECLESIA_GRAPHQL_ENDPOINT && config.ECLESIA_GRAPHQL_SECRET);
    if (isFastSync) {
        const eclesiaClient = new EclesiaClient(config.ECLESIA_GRAPHQL_ENDPOINT!, config.ECLESIA_GRAPHQL_SECRET!);

        const response = await eclesiaClient.getTransactions(startBlock);

        console.info(`Found ${response.transaction.length} transactions`);
        for (const transaction of response.transaction) {
            await processAction({
                hash: transaction.hash,
                height: transaction.block.height.toString(),
                timestamp: transaction.block.timestamp,
                memo: transaction.memo,
                messages: transaction.messages.map((msg) => ({
                    ...msg,
                    from_address: msg['fromAddress'],
                    to_address: msg['toAddress'],
                })),
            } as Action);
        }
    }

    state = new ChronoState({ ...config, START_BLOCK: startBlock.toString(), LOG: true });
    state.onLastBlock(handleLastBlock);
    state.onAction(handleAction);
    state.start();
    console.info(`ChronoState Started`);
    setInterval(handleQueue, process.env.QUEUE_CHECK_MS ? parseInt(process.env.QUEUE_CHECK_MS) : 10);
}

async function main() {
    try {
        await start();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
