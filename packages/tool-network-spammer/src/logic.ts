import type { spammerClient } from './client';

import { LoremIpsum } from 'lorem-ipsum';

import { sendMemo } from './client';

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 6,
    min: 3,
  },
  wordsPerSentence: {
    max: 6,
    min: 2,
  },
});
interface hash {
  hash: string;
  isReply: boolean;
}

let hashes: hash[] = [];

function storeHash(hash: string, isReply: boolean) {
  if (!hash) return;
  hashes.push({
    hash,
    isReply,
  });
}

function removeHash(hash: string) {
  hashes = hashes.filter(h => h.hash !== hash);
}

function getRandomHash(): hash {
  if (hashes.length === 0)
    return { hash: '', isReply: false };
  return hashes[Math.floor(Math.random() * hashes.length)];
}

// TODO: Add support for user handle (registerHandle, transferHandle, acceptHandle, displayHandle)
const actions = ['post', 'reply', 'like', 'dislike', 'delete', 'flag'] as const;
type ActionType = (typeof actions)[number];

function chooseRandomAction(): ActionType {
  if (hashes.length === 0)
    return 'post';
  return actions[Math.floor(Math.random() * actions.length)];
}

export async function publishSomething(client: spammerClient) {
  const action = chooseRandomAction();

  const postHash = getRandomHash();
  let memo = '';

  switch (action) {
    case 'post': {
      const message = lorem.generateSentences(1);
      memo = `dither.Post("${message}")`;
      break;
    }
    case 'reply': {
      const reply = lorem.generateSentences(1);
      memo = `dither.Reply("${postHash.hash}","${reply}")`;
      break;
    }
    case 'like': {
      memo = `dither.Like("${postHash.hash}",${postHash.isReply})`;
      break;
    }
    case 'dislike': {
      memo = `dither.Dislike("${postHash.hash}",${postHash.isReply})`;
      break;
    }
    case 'flag': {
      memo = `dither.Flag("${postHash.hash}",${postHash.isReply})`;
      break;
    }
    case 'delete': {
      memo = `dither.Remove("${postHash.hash}")`;
      break;
    }
  }

  const result = await sendMemo(client, memo);
  if (!result) {
    return;
  }

  console.log(`[${action}] Result: ${result.transactionHash}`);

  if (['post', 'reply'].includes(action)) {
    storeHash(result?.transactionHash || '', action === 'reply');
  }

  if (action === 'delete') {
    removeHash(postHash.hash);
  }
}
