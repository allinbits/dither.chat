import type { Client } from 'pg';
import type { LogicalReplicationService, Pgoutput, PgoutputPlugin } from 'pg-logical-replication';

import type { Publisher } from './publisher';

export class FeedReplicationService {
  private service: LogicalReplicationService;
  private plugin: PgoutputPlugin;
  private slotName: string;
  private publisher: Publisher;

  constructor(service: LogicalReplicationService, plugin: PgoutputPlugin, slotName: string, publisher: Publisher) {
    this.service = service;
    this.plugin = plugin;
    this.slotName = slotName;
    this.publisher = publisher;
    this.setupEventHandlers();
  }

  async start(): Promise<void> {
    await this.service.subscribe(this.plugin, this.slotName);
  }

  private setupEventHandlers(): void {
    this.service.on('data', this.handleData.bind(this));
    this.service.on('error', this.handleError.bind(this));
  }

  private async handleData(_: string, log: Pgoutput.Message): Promise<void> {
    if (log.tag === 'insert') {
      await this.publisher.publish(log.new);
    }
  }

  private handleError(err: Error): void {
    console.error(err);
  }
}

// Creates a PostgreSQL logical replication slot when it doesn't exist.
// Slot can then be used by the feed replication service to subscribe and receive new posts.
export async function ensureReplicationSlot(client: Client, name: string): Promise<void> {
  // Check if slot exists
  const { rows } = await client.query('SELECT count(*)::int FROM pg_replication_slots WHERE slot_name = $1', [name]);
  console.debug(rows);
  if (rows[0].count) {
    return;
  }

  // Create the new replication slot when it doesn't exists
  await client.query(`SELECT pg_create_logical_replication_slot($1, 'pgoutput')`, [name]);
}

// Creates a PostgreSQL publication that publishes feed table INSERT operations.
// This is required so the feed replication service receives a message each time
// a new post is created in the feed table.
export async function setupPublication(client: Client, name: string): Promise<void> {
  // Check if publication exists
  const { rows } = await client.query(`SELECT count(*)::int FROM pg_publication WHERE pubname = $1`, [name]);
  if (rows[0].count) {
    return;
  }

  // Create a new publication for feed table inserts
  await client.query(`CREATE PUBLICATION ${name} FOR TABLE feed WITH (publish = 'insert')`);
}
