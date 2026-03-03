export interface Transaction {
  hash: string;
  block: {
    height: string;
    timestamp: string;
  };
  memo: string;
  messages: any[];
}

export interface FastSyncResult {
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
    has_more: boolean;
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

  async getTransactions(min_height: number = 0, limit: number = 500): Promise<FastSyncResult> {
    const transactions: Transaction[] = [];
    let offset = 0;
    let latest_block_height = 0;

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

      latest_block_height = data.latest_block_height;
      transactions.push(...data.transactions);

      if (!data.pagination.has_more) {
        break;
      }

      offset += limit;
    }

    return {
      latest_block_height,
      transactions,
    };
  }
}
