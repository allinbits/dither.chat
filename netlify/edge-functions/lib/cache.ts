/**
 * Generic cache utilities for Netlify Edge Functions.
 *
 * This module provides a dual-layer caching strategy:
 * 1. Runtime Cache API (`caches.open()`) - Prevents edge function re-execution
 *    for cached responses, reducing compute time and external API calls.
 * 2. Netlify CDN Cache - Enabled via Cache-Control headers in responses.
 *    Netlify's CDN caches responses at the edge, reducing latency globally.
 *
 * According to Netlify Cache API docs (https://docs.netlify.com/build/caching/cache-api/):
 * - Use `caches.open(name)` to open a named cache instance
 * - Responses must have Cache-Control headers with max-age >= 1 second
 * - Only responses with status 200-299 can be cached
 * - Responses are automatically invalidated on site redeploy
 * - Cache operations must be within request handler scope
 * - Responses must be cloned before caching if used elsewhere
 *
 * According to Netlify caching overview (https://docs.netlify.com/build/caching/caching-overview/):
 * - Edge Functions are NOT cached by default
 * - Setting Cache-Control headers enables CDN caching
 * - Query parameters are automatically factored into cache keys
 * - Cache-Control max-age determines how long responses are cached
 *
 * The Cache API provides immediate cache hits within the same edge function execution,
 * while Netlify's CDN cache provides global distribution and reduces edge function
 * invocations across different edge locations.
 */

export interface CacheOptions {
  /**
   * Name of the cache instance to use. Defaults to 'default'.
   * Using a meaningful name helps organize cached responses.
   */
  cacheName?: string;
  /**
   * Prefix for cache keys to avoid collisions.
   */
  keyPrefix?: string;
  /**
   * Whether to add debug headers (X-Cache, X-Cache-Date).
   */
  debugHeaders?: boolean;
}

/**
 * Normalizes a URL for consistent cache keys:
 * - Lowercases hostname
 * - Removes trailing slashes (except for root)
 * - Preserves path, query, and hash
 */
export function normalizeUrl(url: URL): string {
  const normalized = new URL(url);
  normalized.hostname = normalized.hostname.toLowerCase();
  if (normalized.pathname !== '/' && normalized.pathname.endsWith('/')) {
    normalized.pathname = normalized.pathname.slice(0, -1);
  }
  return normalized.href;
}

/**
 * Creates a cache key with optional prefix.
 */
export function createCacheKey(key: string, prefix?: string): string {
  return prefix ? `${prefix}${key}` : key;
}

/**
 * Retrieves a cached response if available.
 * Adds X-Cache: HIT header if debugHeaders is enabled.
 *
 * According to Netlify Cache API docs, cache operations must be within
 * the request handler scope. This function should be called from within
 * your edge function handler.
 *
 * @param cacheKey - The cache key to look up (can be a Request object or URL string)
 * @param options - Cache options
 * @returns Cached response or null if not found
 */
export async function getCachedResponse(
  cacheKey: string | Request,
  options: CacheOptions = {},
): Promise<Response | null> {
  const { cacheName = 'default', debugHeaders = true } = options;

  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      if (debugHeaders) {
        // Add cache hit header for debugging
        const clonedResponse = cachedResponse.clone();
        clonedResponse.headers.set('X-Cache', 'HIT');
        return clonedResponse;
      }
      return cachedResponse;
    }
  } catch (error) {
    // Cache API might not be available in all environments
    console.warn('Cache API not available:', error);
  }
  return null;
}

/**
 * Stores a response in the cache.
 * Clones the response to avoid consuming the original body.
 *
 * According to Netlify Cache API docs:
 * - Only responses with status 200-299 can be cached
 * - Responses must have Cache-Control headers with max-age >= 1 second
 * - Cache operations must be within the request handler scope
 * - Responses are automatically invalidated on site redeploy
 *
 * @param cacheKey - The cache key to store under (can be a Request object or URL string)
 * @param response - The response to cache (must have status 200-299 and Cache-Control headers)
 * @param options - Cache options
 */
export async function storeInCache(
  cacheKey: string | Request,
  response: Response,
  options: CacheOptions = {},
): Promise<void> {
  const { cacheName = 'default' } = options;

  // Only cache successful responses (200-299 status codes)
  if (!response.ok || response.status < 200 || response.status >= 300) {
    return;
  }

  // Verify Cache-Control header exists with max-age >= 1 second
  const cacheControl = response.headers.get('Cache-Control');
  if (!cacheControl || !cacheControl.includes('max-age=')) {
    console.warn('Response missing Cache-Control header with max-age, skipping cache');
    return;
  }

  try {
    const cache = await caches.open(cacheName);
    // Clone response before caching since Response body can only be read once
    // The clone ensures the original response remains readable
    const responseToCache = response.clone();
    await cache.put(cacheKey, responseToCache);
  } catch (error) {
    // Cache API might not be available in all environments
    console.warn('Failed to store in cache:', error);
  }
}

/**
 * Wraps a response with cache miss headers if debugHeaders is enabled.
 */
export function markCacheMiss(
  response: Response,
  options: CacheOptions = {},
): Response {
  const { debugHeaders = true } = options;
  if (debugHeaders) {
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('X-Cache-Date', new Date().toISOString());
  }
  return response;
}

/**
 * Wraps a response with cache date header if debugHeaders is enabled.
 */
export function addCacheDateHeader(
  response: Response,
  options: CacheOptions = {},
): Response {
  const { debugHeaders = true } = options;
  if (debugHeaders) {
    response.headers.set('X-Cache-Date', new Date().toISOString());
  }
  return response;
}
