import type { Action } from '@atomone/chronostate/dist/types';
import type { MsgGeneric, MsgTransfer } from './types';
import type { ResponseStatus } from './types/index';

import { ChronoState } from '@atomone/chronostate';

import { useConfig } from './config/index';
import { MessageHandlers } from './messages/index';
import { useQueue } from './queue';

const config = useConfig();
const queue = useQueue();
const actionTypes = ['Post', 'Reply', 'Like', 'Flag', 'Dislike', 'Follow', 'Unfollow', 'Remove'];

let state: ChronoState;
let lastHash: string;
let _lastBlock: string;
let isProcessing = false;

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

function handleLastBlock(block: string) {
    // db.lastBlock.update(block as string);
    // Need to switch this out to store last block somewhere, otherwise rely on
    console.log(`Updated | Block: ${block} | Queue Size: ${queue.size()} | Retry Count: ${queue.getRetryCount()}`);
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

async function handleQueue() {
    if (!queue.hasElements() || isProcessing) {
        return;
    }

    // Process Action
    isProcessing = true;
    const response = await processAction(queue.peek());

    // Success OR explicitly skip
    if (response === 'SUCCESS' || response === 'SKIP') {
        queue.remove();
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

export async function start() {
    state = new ChronoState({ ...config });
    state.onLastBlock(handleLastBlock);
    state.onAction(handleAction);
    state.start();
    setInterval(handleQueue, 5);
}

start();
