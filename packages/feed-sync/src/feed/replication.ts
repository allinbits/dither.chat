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
