/**
 * Fetches Open Graph metadata from external URLs.
 * Returns 200 with error field for graceful degradation.
 *
 * Caching Strategy:
 * - Uses Cache API (`caches.open()`) to prevent re-execution for cached URLs
 * - Sets Cache-Control headers (7 days) to enable Netlify CDN caching
 * - Query parameters (`url`) are automatically factored into cache keys by Netlify
 * - Normalizes URLs to ensure consistent cache keys (lowercase hostname, no trailing slashes)
 *
 * See:
 * - https://docs.netlify.com/build/caching/caching-overview/
 * - https://docs.netlify.com/build/caching/cache-api/
 */

import {
  addCacheDateHeader,
  createCacheKey,
  getCachedResponse,
  markCacheMiss,
  normalizeUrl,
  storeInCache,
} from './lib/cache.ts';
import {
  createClientErrorResponse,
  createErrorResponse,
  createJsonResponse,
} from './lib/http.ts';
import { extractMetadata } from './lib/opengraph.ts';

const FETCH_TIMEOUT_MS = 10000; // 10 seconds per issue #430
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days per issue #430
const USER_AGENT = 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://dither.chat)';
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;
const MAX_URL_LENGTH = 2048;
const MAX_HTML_SIZE = 5 * 1024 * 1024;
const CACHE_KEY_PREFIX = 'link-meta:';

function isPrivateIP(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    return true;
  }

  // Block private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
  if (
    hostname.startsWith('192.168.')
    || hostname.startsWith('10.')
    || hostname.startsWith('169.254.')
    || (hostname.startsWith('172.') && /^172\.(?:1[6-9]|2\d|3[01])\./.test(hostname))
  ) {
    return true;
  }

  return false;
}

function validateUrl(
  url: string,
): { success: true; url: URL } | { success: false; error: string } {
  if (url.length > MAX_URL_LENGTH) {
    return { success: false, error: 'URL too long' };
  }

  try {
    const parsedUrl = new URL(url);

    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as typeof ALLOWED_PROTOCOLS[number])) {
      return { success: false, error: 'Invalid URL protocol' };
    }

    if (isPrivateIP(parsedUrl.hostname)) {
      return { success: false, error: 'Invalid URL hostname' };
    }

    return { success: true, url: parsedUrl };
  } catch {
    return { success: false, error: 'Invalid URL format' };
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function handleFetchError(error: unknown): string {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Request timeout';
  }
  return 'Network error: Unable to reach the URL';
}

function getHttpErrorMessage(status: number): string {
  if (status >= 400 && status < 500) {
    return 'URL not accessible (client error)';
  }
  if (status >= 500) {
    return 'Server error: Target site is unavailable';
  }
  return 'Unable to fetch metadata';
}

function isHtmlContent(contentType: string | null): boolean {
  const normalized = (contentType || '').toLowerCase();
  return normalized.includes('text/html') || normalized.includes('text/xml');
}

async function extractHtmlContent(
  response: Response,
  baseUrl: URL,
): Promise<{ success: true; html: string } | { success: false; response: Response }> {
  try {
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = Number.parseInt(contentLength, 10);
      if (size > MAX_HTML_SIZE) {
        return {
          success: false,
          response: createErrorResponse('Page content too large', baseUrl.href),
        };
      }
    }

    const html = await response.text();

    if (html.length > MAX_HTML_SIZE) {
      return {
        success: false,
        response: createErrorResponse('Page content too large', baseUrl.href),
      };
    }

    return { success: true, html };
  } catch {
    return {
      success: false,
      response: createErrorResponse('Failed to read page content', baseUrl.href),
    };
  }
}

async function processResponse(
  response: Response,
  baseUrl: URL,
): Promise<Response> {
  if (!response.ok) {
    return createErrorResponse(
      getHttpErrorMessage(response.status),
      baseUrl.href,
    );
  }

  const contentType = response.headers.get('content-type');
  if (!isHtmlContent(contentType)) {
    return createErrorResponse(
      'URL does not point to an HTML page',
      baseUrl.href,
    );
  }

  const htmlResult = await extractHtmlContent(response, baseUrl);
  if (!htmlResult.success) {
    return htmlResult.response;
  }

  const metadata = extractMetadata(htmlResult.html, baseUrl);
  const jsonResponse = createJsonResponse(metadata, {
    cacheMaxAge: CACHE_TTL_SECONDS,
  });

  // Add cache date header for debugging
  return addCacheDateHeader(jsonResponse);
}

async function handleRequestProcessing(
  targetUrl: string,
  parsedUrl: URL,
): Promise<Response> {
  // Normalize URL for cache key
  const normalizedUrl = normalizeUrl(parsedUrl);
  const cacheKey = createCacheKey(normalizedUrl, CACHE_KEY_PREFIX);

  // Check cache first using a named cache instance
  const cachedResponse = await getCachedResponse(cacheKey, {
    cacheName: 'link-meta',
  });
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetchWithTimeout(targetUrl);
    const processedResponse = await processResponse(response, parsedUrl);

    // Only cache successful responses (200 status)
    // storeInCache validates status and Cache-Control headers internally
    if (processedResponse.status === 200) {
      // Store in cache asynchronously (don't await to avoid blocking)
      storeInCache(cacheKey, processedResponse, {
        cacheName: 'link-meta',
      }).catch((error) => {
        console.warn('Background cache store failed:', error);
      });
    }

    // Add cache miss header for debugging
    return markCacheMiss(processedResponse);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(handleFetchError(error), parsedUrl.href);
    }

    console.error('Error in link-meta:', error);
    return createErrorResponse('Failed to process metadata', parsedUrl.href);
  }
}

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return createClientErrorResponse('Missing url parameter');
  }

  const urlValidation = validateUrl(targetUrl);
  if (!urlValidation.success) {
    return createClientErrorResponse(urlValidation.error);
  }

  return await handleRequestProcessing(targetUrl, urlValidation.url);
};
