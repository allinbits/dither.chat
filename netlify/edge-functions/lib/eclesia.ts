/**
 * Eclesia GraphQL indexer client for Netlify edge functions.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Transaction {
  hash: string;
  block: {
    height: string;
    timestamp: string;
  };
  memo: string;
  // deno-lint-ignore no-explicit-any
  messages: any[];
}

export interface TransactionsResult {
  latest_block_height: number;
  transactions: Transaction[];
}

interface GraphQLError {
  message: string;
  extensions?: {
    path?: string;
    code?: string;
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

interface GetTransactionsResponse {
  latest_block_stored: { height: number }[];
  transactions: Transaction[];
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class EclesiaClient {
  private readonly endpoint: string;
  private readonly secret: string;

  constructor(endpoint: string, secret: string) {
    this.endpoint = endpoint;
    this.secret = secret;
  }

  async getTransactions(
    min_height: number,
    limit: number,
    offset: number,
  ): Promise<TransactionsResult> {
    const QUERY = `
      query GetTransactions($limit: Int, $offset: Int, $min_height: bigint) {
        latest_block_stored: blocks(limit: 1, order_by: { height: desc }) {
          height
        }

        transactions(
          limit: $limit
          offset: $offset
          where: { memo: { _like: "dither.%" }, height: { _gte: $min_height } }
          order_by: { height: asc }
        ) {
          hash
          block {
            height
            timestamp
          }
          memo
          messages
        }
      }
    `;
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": this.secret,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { limit, offset, min_height },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GraphQL request failed with status ${response.status}: ${await response.text()}`,
      );
    }

    const json =
      (await response.json()) as GraphQLResponse<GetTransactionsResponse>;

    if (json.errors && json.errors.length > 0) {
      throw new Error(
        `GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`,
      );
    }

    if (!json.data) {
      throw new Error("GraphQL response contained no data");
    }

    console.log(json.data);

    return {
      latest_block_height: json.data.latest_block_stored[0]?.height ?? 0,
      transactions: json.data.transactions,
    };
  }
}
