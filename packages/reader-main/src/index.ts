import { ChronoState } from '@atomone/chronostate';
import { useConfig } from './config';
import { Action } from '@atomone/chronostate/dist/types';
import amqplib from 'amqplib';
import { useEventConfig } from './event-config';

const config = useConfig();
const eventConfig = useEventConfig();
const actionTypes = ['Post', 'Reply', 'Like', 'Flag', 'Dislike', 'Follow', 'Unfollow']; // Extend as required;

let state: ChronoState;
let lastBlock: string;
let channel: amqplib.Channel;

async function handleAction(action: Action) {
    
    for (const actionType of actionTypes) {
        if (action.memo.startsWith(config.MEMO_PREFIX+actionType)) {            
            await channel.publish(eventConfig.exchange, actionType, Buffer.from(JSON.stringify(action)));            
            break;
        }else{
            continue;
        }
    }

}

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
