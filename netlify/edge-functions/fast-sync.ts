/**
 * Fast-sync edge function that proxies the Eclesia GraphQL indexer
 * and returns dither transactions in a paginated fashion.
 *
 * Environment variables (set in Netlify dashboard):
 *   - ECLESIA_GRAPHQL_ENDPOINT  (required)
 *   - ECLESIA_GRAPHQL_SECRET    (required)
 *   - FAST_SYNC_MAX_LIMIT       (optional, default: 500)
 *
 * Query parameters:
 *   - min_height  (optional, default: 0)   – only return txs at or above this block height
 *   - limit       (optional, default: FAST_SYNC_MAX_LIMIT) – number of transactions per page (capped at FAST_SYNC_MAX_LIMIT)
 *   - offset      (optional, default: 0)   – pagination offset
 */

import { EclesiaClient, type Transaction } from "./lib/eclesia.ts";
import {
  createClientErrorResponse,
  createInternalErrorResponse,
  createJsonResponse,
} from "./lib/http.ts";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ENDPOINT = Deno.env.get("ECLESIA_GRAPHQL_ENDPOINT");
const SECRET = Deno.env.get("ECLESIA_GRAPHQL_SECRET");
const MAX_LIMIT = parseInt(Deno.env.get("FAST_SYNC_MAX_LIMIT") ?? "500", 10);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Edge function handler
// ---------------------------------------------------------------------------

export default async (request: Request): Promise<Response> => {
  // Only allow GET requests
  if (request.method !== "GET") {
    return createClientErrorResponse("Method not allowed. Use GET.");
  }

  if (!ENDPOINT || !SECRET) {
    console.error(
      "fast-sync: ECLESIA_GRAPHQL_ENDPOINT or ECLESIA_GRAPHQL_SECRET is not set",
    );
    return createInternalErrorResponse("Indexer is not configured.");
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  // Parse & validate query parameters
  const rawMinHeight = params.get("min_height");
  const rawLimit = params.get("limit");
  const rawOffset = params.get("offset");

  const min_height = rawMinHeight !== null ? parseInt(rawMinHeight, 10) : 0;
  const offset = rawOffset !== null ? parseInt(rawOffset, 10) : 0;
  let limit = rawLimit !== null ? parseInt(rawLimit, 10) : MAX_LIMIT;

  if (isNaN(min_height) || min_height < 0) {
    return createClientErrorResponse(
      "Invalid min_height: must be a non-negative integer.",
    );
  }

  if (isNaN(offset) || offset < 0) {
    return createClientErrorResponse(
      "Invalid offset: must be a non-negative integer.",
    );
  }

  if (isNaN(limit) || limit <= 0) {
    return createClientErrorResponse(
      "Invalid limit: must be a positive integer.",
    );
  }

  // Cap limit to the configured maximum
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  try {
    const client = new EclesiaClient(ENDPOINT, SECRET);
    const { latest_block_height, transactions } = await client.getTransactions(
      min_height,
      limit,
      offset,
    );

    const body: FastSyncResponse = {
      latest_block_height,
      transactions,
      pagination: {
        offset,
        limit,
        count: transactions.length,
        has_more: transactions.length === limit,
      },
    };

    return createJsonResponse(body, {
      // No caching: callers always need fresh chain data
      cacheMaxAge: 0,
    });
  } catch (error) {
    console.error("fast-sync: failed to fetch transactions:", error);
    return createInternalErrorResponse(
      "Failed to fetch transactions from indexer.",
    );
  }
};
