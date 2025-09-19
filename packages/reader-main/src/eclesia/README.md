# Eclesia GraphQL Client

A simple TypeScript GraphQL client for querying dither transactions.

## Features

- **Simple API**: Easy-to-use methods for common queries
- **Batch Processing**: Execute multiple queries efficiently
- **TypeScript Support**: Full type safety
- **Memo Pattern Filtering**: Query transactions by specific patterns

## Usage

### Basic Setup

```typescript
import { EclesiaClient } from './client';

// Initialize the client
const client = new EclesiaClient('https://your-graphql-endpoint.com/graphql', {
    'Authorization': 'Bearer your-token-here'
});
```

### Basic Query

```typescript
// Get all dither transactions (default: limit 100, pattern 'dither.%')
const result = await client.getTransactions();
console.log(`Found ${result.transaction.length} transactions`);
```

### Custom Parameters

```typescript
// Get 50 Post transactions
const postResult = await client.getTransactions(50, 'dither.Post%');
console.log(`Found ${postResult.transaction.length} Post transactions`);
```

### Batch Queries

```typescript
// Execute multiple queries at once
const results = await client.batchGetTransactions([
    { limit: 25, memoPattern: 'dither.Post%' },
    { limit: 25, memoPattern: 'dither.Like%' },
    { limit: 25, memoPattern: 'dither.Follow%' }
]);

results.forEach((result, index) => {
    const patterns = ['dither.Post%', 'dither.Like%', 'dither.Follow%'];
    console.log(`${patterns[index]}: ${result.transaction.length} transactions`);
});
```

## API Reference

### EclesiaClient

#### Constructor

```typescript
new EclesiaClient(endpoint: string, headers?: Record<string, string>)
```

#### Methods

- `getTransactions(limit?: number, memoPattern?: string): Promise<TransactionResponse>`
- `batchGetTransactions(queries: Array<{ limit?: number; memoPattern?: string }>): Promise<TransactionResponse[]>`

### Types

```typescript
interface Transaction {
    hash: string;
    block: {
        height: string;
        timestamp: string;
    };
    memo: string;
    messages: any[];
}

interface TransactionResponse {
    transaction: Transaction[];
}
```

## GraphQL Query

The client executes this GraphQL query:

```graphql
query GetTransactions($limit: Int, $memo: String) {
    transaction(
        limit: $limit
        where: { memo: { _like: $memo } }
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
```

## Examples

See `example.ts` for usage examples.
