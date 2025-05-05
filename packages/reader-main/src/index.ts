import type { Action } from '@atomone/chronostate/dist/types';
import type { MsgGeneric, MsgTransfer } from './types';

import { ChronoState } from '@atomone/chronostate';
import amqplib from 'amqplib';

import { useConfig } from './config';
import { useEventConfig } from './event-config';

const config = useConfig();
const eventConfig = useEventConfig();
const actionTypes = ['Post', 'Reply', 'Like', 'Flag', 'Dislike', 'Follow', 'Unfollow', 'Remove']; // Extend as required;

let state: ChronoState;
let channel: amqplib.Channel;
let _lastBlock: string;

export function getTransferMessage(messages: Array<MsgGeneric>) {
    const msgTransfer = messages.find(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');
    if (!msgTransfer) {
        return null;
    }

    return msgTransfer as MsgTransfer;
}

export function getTransferQuantities(messages: Array<MsgGeneric>, denom = 'uatone') {
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
    for (const actionType of actionTypes) {
        if (action.memo.startsWith(config.MEMO_PREFIX + actionType)) {
            const transfer = getTransferMessage(action.messages as Array<MsgGeneric>);
            const quantity = getTransferQuantities(action.messages as Array<MsgGeneric>);
            await channel.publish(eventConfig.exchange, actionType, Buffer.from(JSON.stringify({ sender: transfer?.from_address, quantity: quantity, ...action })));
            break;
        }
        else {
            continue;
        }
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
    const conn = await amqplib.connect(eventConfig.rabbitMQEndpoint);
    channel = await conn.createChannel();
    const exchange = eventConfig.exchange;
    await channel.assertExchange(exchange, 'direct', { durable: eventConfig.durable });
    for (const actionType of actionTypes) {
        await channel.assertQueue(actionType, { durable: eventConfig.durable });
        await channel.bindQueue(actionType, exchange, actionType);
    }
    state = new ChronoState({ ...config });
    state.onLastBlock(handleLastBlock);
    state.onAction(handleAction);
    state.start();
}

start();
