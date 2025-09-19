import { gql, GraphQLClient } from 'graphql-request';

export interface Transaction {
    hash: string;
    block: {
        height: string;
        timestamp: string;
    };
    memo: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[];
}

export interface TransactionResponse {
    latest_block_stored: {
        height: number;
    };
    transaction: Transaction[];
}

export class EclesiaClient {
    private client: GraphQLClient;

    constructor(endpoint: string, secret: string) {
        if (!endpoint) {
            throw new Error('GraphQL endpoint is required');
        }
        if (!secret) {
            throw new Error('ECLESIA_GRAPHQL_SECRET environment variable is required');
        }

        this.client = new GraphQLClient(endpoint, {
            headers: {
                'content-type': 'application/json',
                'x-hasura-admin-secret': secret,
            },
        });
    }

    async getTransactions(min_height: number = 0, limit: number = 0): Promise<TransactionResponse> {
        const query = gql`
            query GetTransactions($limit: Int, $offset: Int, $min_height: bigint) {
                latest_block_stored: block(limit: 1, order_by: { height: desc }) {
                    height
                }

                transaction(
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

        const transactions: Transaction[] = [];
        let offset = 0;
        let latest_block_stored: number = 0;

        while (true) {
            interface QueryResponse {
                latest_block_stored: {
                    height: number;
                }[];
                transaction: Transaction[];
            }

            const response: QueryResponse = await this.client.request(query, {
                limit,
                offset,
                min_height,
            });

            if (response.transaction.length === 0) {
                break;
            }

            latest_block_stored = response.latest_block_stored[0].height;

            transactions.push(...response.transaction);

            if (response.transaction.length < limit) {
                break;
            }
            offset += limit;
        }

        return {
            transaction: transactions,
            latest_block_stored: {
                height: latest_block_stored,
            },
        };
    }
}
