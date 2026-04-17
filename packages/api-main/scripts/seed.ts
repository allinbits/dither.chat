import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

import { getDatabase } from '../drizzle/db';
import {
  CustomFeedsTable,
  DislikesTable,
  FeedTable,
  FlagsTable,
  FollowsTable,
  LikesTable,
} from '../drizzle/schema';

faker.seed(42);

function generateAddress() {
  return `atone1${faker.string.alphanumeric(38).toLowerCase()}`;
}

function generateHash() {
  return faker.string.hexadecimal({ length: 64, prefix: '' }).toLowerCase();
}

function timestamp(daysAgo: number, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

const USERS = Array.from({ length: 20 }, () => generateAddress());

const KEYWORD_MESSAGES = [
  'Just deployed my first Gno realm! #gno #atomone',
  'AtomOne governance proposal is live, go vote!',
  'Building decentralized apps with Gno is amazing',
  'The future of blockchain is AtomOne',
  'Learning Gno programming language today',
  'AtomOne validator setup complete!',
  'AtomOne staking rewards looking good',
  'New Gno tutorial just dropped',
  'Blockchain technology changing everything',
  'AtomOne community is the best',
  'Gno realms are game changers',
  'Web3 social powered by AtomOne',
];

export async function seed() {
  const db = getDatabase();

  console.log('Seeding database...');

  const keywordPosts = KEYWORD_MESSAGES.map(message => ({
    hash: generateHash(),
    author: faker.helpers.arrayElement(USERS),
    timestamp: timestamp(faker.number.int({ min: 0, max: 7 }), faker.number.int({ min: 0, max: 23 })),
    message,
    quantity: faker.number.int({ min: 50, max: 500 }).toString(),
  }));

  const randomPosts = Array.from({ length: 85 }, () => ({
    hash: generateHash(),
    author: faker.helpers.arrayElement(USERS),
    timestamp: timestamp(faker.number.int({ min: 0, max: 14 }), faker.number.int({ min: 0, max: 23 })),
    message: faker.lorem.sentence(),
    quantity: faker.number.int({ min: 10, max: 1000 }).toString(),
  }));

  const posts = [...keywordPosts, ...randomPosts];
  await db.insert(FeedTable).values(posts).onConflictDoNothing();

  const replies = posts.slice(0, 20).map(post => ({
    hash: generateHash(),
    post_hash: post.hash,
    author: faker.helpers.arrayElement(USERS.filter(u => u !== post.author)),
    timestamp: timestamp(0, faker.number.int({ min: 0, max: 12 })),
    message: faker.lorem.sentence(),
    quantity: faker.number.int({ min: 5, max: 100 }).toString(),
  }));

  await db.insert(FeedTable).values(replies).onConflictDoNothing();

  const likes = posts.slice(0, 30).flatMap(post =>
    Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      hash: generateHash(),
      post_hash: post.hash,
      author: faker.helpers.arrayElement(USERS.filter(u => u !== post.author)),
      quantity: faker.number.int({ min: 5, max: 100 }).toString(),
      timestamp: timestamp(0, faker.number.int({ min: 0, max: 24 })),
    })),
  );

  await db.insert(LikesTable).values(likes).onConflictDoNothing();

  await db.execute(sql`
    UPDATE feed SET
      likes = (SELECT COUNT(*) FROM likes WHERE likes.post_hash = feed.hash),
      likes_burnt = (SELECT COALESCE(SUM(CAST(quantity AS NUMERIC)), 0)::text FROM likes WHERE likes.post_hash = feed.hash)
  `);

  const dislikes = posts.slice(-5).map(post => ({
    hash: generateHash(),
    post_hash: post.hash,
    author: faker.helpers.arrayElement(USERS),
    quantity: faker.number.int({ min: 5, max: 50 }).toString(),
    timestamp: timestamp(faker.number.int({ min: 1, max: 5 })),
  }));

  await db.insert(DislikesTable).values(dislikes).onConflictDoNothing();

  const flags = posts.slice(-3).map(post => ({
    hash: generateHash(),
    post_hash: post.hash,
    author: faker.helpers.arrayElement(USERS),
    quantity: faker.number.int({ min: 10, max: 100 }).toString(),
    timestamp: timestamp(faker.number.int({ min: 1, max: 5 })),
  }));

  await db.insert(FlagsTable).values(flags).onConflictDoNothing();

  const follows: { follower: string; following: string; hash: string; timestamp: Date }[] = [];
  for (const user of USERS.slice(0, 10)) {
    const toFollow = faker.helpers.arrayElements(USERS.filter(u => u !== user), { min: 2, max: 5 });
    for (const target of toFollow) {
      follows.push({
        follower: user,
        following: target,
        hash: generateHash(),
        timestamp: timestamp(faker.number.int({ min: 1, max: 10 })),
      });
    }
  }

  await db.insert(FollowsTable).values(follows).onConflictDoNothing();

  await db.insert(CustomFeedsTable).values([
    { slug: 'high-value', author: USERS[0], name: 'High Value Posts', query: 'quantity[$gte]=100&sort=-timestamp', timestamp: timestamp(1) },
  ]).onConflictDoNothing();

  console.log('Seed complete!');
}

if (import.meta.main) {
  seed();
}
