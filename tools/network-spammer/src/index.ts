import dotenv from 'dotenv';
import axios from 'axios';
import { generateMessage } from './logic';
import { getCosmosClient, sendMemo} from './client';
dotenv.config();


const interval = parseInt(process.env.INTERVAL_MS || '5000', 10);

async function postMessage() {
  const client = await getCosmosClient();
  try {
    const memo = `dither.Post("${generateMessage()}")`;
    await sendMemo(client, memo);
    console.log('[message] Posted:', memo);
  } catch (err: any) {
    console.error('[message] Error:', err.message);
  }
}

async function replyBot(postHash: string) {
  const client = await getCosmosClient();
  const memo = `dither.Reply("${postHash}","${generateMessage()}")`;
  try {
    await sendMemo(client, memo);
    console.log('[reply] Sent reply to message 123');
  } catch (err: any) {
    console.error('[reply] Error:', err.message);
  }
}

setInterval(() => {
  postMessage();
  replyBot("123");
}, interval);

console.log(`[runner] Running every ${interval}ms`);