import dotenv from 'dotenv';

import { getClients } from './client';
import { publishSomething } from './logic';
dotenv.config();

const interval = parseInt(process.env.INTERVAL_MS || '5000', 10);
let lastBlock = 0;
setInterval(async () => {
  const clients = await getClients();
  const currentBlock = await clients[0].client.getHeight();
  // do nothing if we are on the same block
  if (currentBlock === lastBlock) return;

  lastBlock = currentBlock;

  for (const client of clients) {
    await publishSomething(client);
  }
}, interval);

console.log(`[runner] Running every ${interval}ms`);
