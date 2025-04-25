import { ChronoState } from '@atomone/chronostate';
import { useConfig } from './config';
import amqplib from 'amqplib';
const config = useConfig();
let state;
let lastBlock;
let channel;
async function handleAction(action) {
    if (action.memo.startsWith('dither.Post')) {
        channel.publish("dither", "dither.Post", Buffer.from(JSON.stringify(action)));
    }
    if (action.memo.startsWith('dither.Reply')) {
        channel.publish("dither", "dither.Reply", Buffer.from(JSON.stringify(action)));
    }
}
function handleLastBlock(block) {
    // db.lastBlock.update(block as string);
    // Need to switch this out to store last block somewhere, otherwise rely on
    console.log(`Updated Block | ${block}`);
}
export async function start() {
    // lastBlock = await db.lastBlock.select();
    // state = new ChronoState({ ...config, START_BLOCK: lastBlock });
    const conn = await amqplib.connect('amqp://rabbitmq');
    channel = await conn.createChannel();
    const exchange = 'dither';
    channel.assertExchange(exchange, 'chronostate', { durable: true });
    state = new ChronoState({ ...config });
    state.onLastBlock(handleLastBlock);
    state.onAction(handleAction);
    state.start();
}
start();
