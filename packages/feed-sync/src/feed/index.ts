import type { LogicalReplicationService, Pgoutput, PgoutputPlugin } from 'pg-logical-replication';

export class FeedReplicationService {
  private service: LogicalReplicationService;
  private plugin: PgoutputPlugin;
  private slotName: string;

  constructor(service: LogicalReplicationService, plugin: PgoutputPlugin, slotName: string) {
    this.service = service;
    this.plugin = plugin;
    this.slotName = slotName;
    this.setupEventHandlers();
  }

  async start(): Promise<void> {
    await this.service.subscribe(this.plugin, this.slotName);
  }

  private setupEventHandlers(): void {
    this.service.on('data', this.handleData.bind(this));
    this.service.on('error', this.handleError.bind(this));
  }

  private handleData(lsn: string, log: Pgoutput.Message): void {
    switch (log.tag) {
      // handle insert events in the db
      case 'insert':
        console.log(log);
        break;
    }
  }

  private handleError(err: Error): void {
    console.error(err);
  }
}
