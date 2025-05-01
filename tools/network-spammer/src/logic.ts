import { LoremIpsum } from "lorem-ipsum";
import { getCosmosClient, sendMemo } from "./client";

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

let postHashes: string[] = [];

function storePostHash(hash: string) {
  if (hash != "") postHashes.push(hash);
}

function removePostHash(hash: string) {
  postHashes = postHashes.filter((h) => h != hash);
}

function getRandomPostHash(): string {
  if (postHashes.length === 0) return "";
  return postHashes[Math.floor(Math.random() * postHashes.length)];
}

const actions = ["post", "reply", "like", "dislike", "delete"] as const;
type ActionType = (typeof actions)[number];

function chooseRandomAction(): ActionType {
  if (postHashes.length === 0) return "post";
  return actions[Math.floor(Math.random() * actions.length)];
}

export async function publishSomething() {
  const action = chooseRandomAction();
  const client = await getCosmosClient();
  const postHash = getRandomPostHash();
  let memo = "";

  switch (action) {
    case "post": {
      const message = lorem.generateSentences(1);
      memo = `dither.Post("${message}")`;
      break;
    }
    case "reply": {
      const reply = lorem.generateSentences(1);
      memo = `dither.Reply("${postHash}","${reply}")`;
      break;
    }
    case "like": {
      memo = `dither.Like("${postHash}")`;
      break;
    }
    case "dislike": {
      memo = `dither.Dislike("${postHash}")`;
      break;
    }
    case "delete": {
      memo = `dither.PostRemove("${postHash}")`;
      break;
    }
  }

  const result = await sendMemo(client, memo);
  if (!result) {
    return;
  }

  console.log(`[${action}] Result: ${result.transactionHash}`);

  if (action === "post") {
    storePostHash(result?.transactionHash || "");
  }

  if (action === "delete") {
    removePostHash(postHash);
  }
}
