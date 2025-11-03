import type { Client } from 'pg';
import type { Pgoutput } from 'pg-logical-replication';

import type { Publisher } from './publisher';

import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';
import retry from 'retry';

import logger from '../logger';

// Number of times service tries to publish a post when publishing fails.
const publishRetries = 10;

// Feed replications service listens for PostgreSQL logical replication events and publishes new posts to Telegram.
export class FeedReplicationService {
  private service: LogicalReplicationService;
  private plugin: PgoutputPlugin;
  private slotName: string;
  private publisher: Publisher;
  private stopping: boolean;
  private lastLsn: string;
  private walQueue: { lsn: string; post: Record<string, any> }[];

  constructor(postgresUri: string, publicationName: string, slotName: string, publisher: Publisher) {
    this.slotName = slotName;
    this.publisher = publisher;
    this.walQueue = [];
    this.stopping = false;

    this.service = new LogicalReplicationService(
      {
        connectionString: postgresUri,
        connectionTimeoutMillis: 0,
      },
      {
        // Replication acknowledge must be done manually by the feed service
        // once a post is successfully published to Telegram
        acknowledge: {
          auto: false,
          timeoutSeconds: 0,
        },
      },
    );

    this.plugin = new PgoutputPlugin({
      protoVersion: 1,
      publicationNames: [publicationName],
    });

    this.lastLsn = this.service.lastLsn();
    this.setupEventHandlers();
  }

  // Checks if the last acknowledged LSN is lower than other LSN.
  private isLastLsnLowerThan(lsn: string): boolean {
    if (this.lastLsn === lsn) return false;

    // LSN format is 00000000/00000000, where each part is an hexadecimal
    // number with a max of 8 digit each, for example 0/B374D848.
    const partsA = this.lastLsn.split('/');
    const partsB = lsn.split('/');
    const [prefixA, suffixA]: [number, number] = [Number.parseInt(partsA[0], 16), Number.parseInt(partsA[1], 16)];
    const [prefixB, suffixB]: [number, number] = [Number.parseInt(partsB[0], 16), Number.parseInt(partsB[1], 16)];

    if (prefixA === prefixB) {
      return suffixA < suffixB;
    }
    return prefixA < prefixB;
  }

  // Configures logical replication event handlers.
  private setupEventHandlers(): void {
    this.service.on('error', (e: Error) => {
      // TODO: Should feed service stop when there is an error in the communication?
      logger.error('Feed replication error', { err: e.message });
    });

    // When replication data is received add WAL log a queue to make sure logs are handled sequentially.
    // Pending logs are sent one after the other by PostgreSQL without waiting for aknowledge, so they
    // have to be queued to be handled sequentially, in case one of them fails to be published to Telegram.
    // Following logs shoudln't be acknoledged when a previous log fails to be published to Telegram.
    this.service.on('data', (lsn: string, log: Pgoutput.Message) => {
      if (log.tag === 'insert') {
        this.walQueue.push({ lsn, post: log.new });
      }
    });

    // Handle heartbeats to keep connection with PostgreSQL alive and to make sure that the last
    // recieved WAL log is acknowledged properly, so WAL logs doesn't stopre published posts.
    this.service.on('heartbeat', async (lsn: string): Promise<void> => {
      // Check LSN when there are queued posts to be handled.
      // Make sure to only acknowledge current or previous LSN values.
      // Queue processing is sequential, so no future LSN values must be acknowledged
      // to avoid loosing posts. Acknoledging deletes posts from the WAL, so only the
      // ones published to Telegram must be acknowledged.
      if (this.walQueue.length !== 0 && this.isLastLsnLowerThan(lsn)) {
        // Don't acknowledge LSN values that were not handled yet.
        // PostgreSQL drops the connection after a while if LSN values are not acknoledged
        // after a while. This can happen when PostgreSQL config `wal_sender_timeout` is not 0.
        return;
      }

      // Acknowledge all LSN values when there are no post to be handled.
      // This also keeps connection with PostgreSQL alive.
      await this.service.acknowledge(lsn);
      logger.debug('Heartbeat acknowledge', { lsn });
    });
  }

  // Starts feed replication service.
  async start(): Promise<void> {
    // Start a publisher to publish queued posts to Telegram and also subscribe to replication events
    // TODO: Implement a way to use more than 1 CPU (libuv, greenlets?)
    await Promise.all([this.startPublisher(2000), this.service.subscribe(this.plugin, this.slotName)]);
  }

  // Stops feed replication service.
  async stop(): Promise<void> {
    this.stopping = true;
    await this.service.stop();
  }

  // Start a publisher that regularly publishes queued posts to Telegram.
  //
  // Feed replication service is stopped when a post fails to be published, because posts
  // must be published sequentially, in the same order they are received.
  // Posts can only be published is all previous posts were successfully published before.
  private async startPublisher(timeout: number): Promise<void> {
    const publisher = async () => {
      if (this.walQueue.length) {
        const { lsn, post } = this.walQueue[0];
        try {
          await this.publish(lsn, post, publishRetries);
        } catch (e) {
          // Stop replication service when post can't be published to Telegram after multiple attempts.
          // This must be done to avoid acknowledging any post that followed the one that failed.
          // If a following post is acknowledge it would remove the one that failed from the WAL so it
          // won't be published again by PostgreSQL.
          await this.stop();
          throw e;
        }
      }

      if (this.stopping) {
        logger.debug(`Stopping feed publisher...`);
        return;
      }

      // TODO: Is there a better way to execute recurrent tasks?
      const tick: Promise<void> = new Promise((resolve, reject) => {
        setTimeout(() => publisher().then(resolve).catch(reject), timeout);
      });

      await tick;
    };

    // Start publishing queued posts to Telegram
    await publisher();
    logger.info('Started feed publisher');
  }

  // Publish a post to Telegram.
  private async publish(lsn: string, post: Record<string, any>, retries: number): Promise<void> {
    const operation = retry.operation({ retries });

    return new Promise((resolve, reject) => {
      operation.attempt(async (attempt: number) => {
        try {
          await this.publisher.publish(post);

          // Acknowledged so the post is removed from the WAL
          await this.service.acknowledge(lsn);

          // Remove the published post from the queue and refresh LSN
          this.walQueue.shift();
          this.lastLsn = lsn;

          resolve();
        } catch (e) {
          if (operation.retry(e as Error)) {
            logger.warn('Post publish failed', {
              attempt,
              hash: post.hash,
              cause: (e as Error).message,
            });
          }

          // Fail when maximum number of retries is reach and post failed to be published to Telegram
          if (attempt === retries && e) {
            reject(new Error(`Post publish failed for hash ${post.hash} with timestamp ${post.timestamp}`));
          }
        }
      });
    });
  }
}

// Creates a PostgreSQL logical replication slot when it doesn't exist.
// Slot can then be used by the feed replication service to subscribe and receive new posts.
export async function ensureReplicationSlot(client: Client, name: string): Promise<void> {
  // Check if slot exists
  const { rows } = await client.query('SELECT count(*)::int FROM pg_replication_slots WHERE slot_name = $1', [name]);
  if (rows[0].count) {
    return;
  }

  // Create the new replication slot when it doesn't exists
  await client.query(`SELECT pg_create_logical_replication_slot($1, 'pgoutput')`, [name]);
}

// Creates a PostgreSQL publication that publishes feed table INSERT operations.
// This is required so the feed replication service receives a message each time
// a new post is created in the feed table.
export async function ensurePublication(client: Client, name: string): Promise<void> {
  // Check if publication exists
  const { rows } = await client.query(`SELECT count(*)::int FROM pg_publication WHERE pubname = $1`, [name]);
  if (rows[0].count) {
    return;
  }

  // Create a new publication for feed table inserts
  await client.query(`CREATE PUBLICATION ${name} FOR TABLE feed WITH (publish = 'insert')`);
}
