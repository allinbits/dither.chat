export interface Transaction {
  hash: string;
  block: {
    height: string;
    timestamp: string;
  };
  memo: string;
  messages: any[];
}

export interface FastSyncPage {
  latest_block_height: number;
  transactions: Transaction[];
}

interface FastSyncResponse {
  latest_block_height: number;
  transactions: Transaction[];
  pagination: {
    offset: number;
    limit: number;
    count: number;
    may_have_more: boolean;
  };
}

export class FastSyncClient {
  private readonly url: string;

  constructor(url: string) {
    if (!url) {
      throw new Error('FAST_SYNC_URL is required');
    }
    this.url = url;
  }

  async* getTransactions(min_height: number = 0, limit: number = 500): AsyncGenerator<FastSyncPage> {
    let offset = 0;

    while (true) {
      const url = new URL(this.url);
      url.searchParams.set('min_height', min_height.toString());
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('offset', offset.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`fast-sync request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as FastSyncResponse;

      yield {
        latest_block_height: data.latest_block_height,
        transactions: data.transactions,
      };

      if (!data.pagination.may_have_more) {
        break;
      }

      offset += limit;
    }
  }
}
