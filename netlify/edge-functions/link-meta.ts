/**
 * Fetches Open Graph metadata from external URLs.
 *
 * Intercepts `/link-meta?url={encoded_url}` requests and returns JSON with OG metadata.
 *
 * @param request - The incoming HTTP request
 * @returns JSON response with link metadata (200 status) or error (400 for client errors)
 * @note Returns 200 with error field for graceful degradation instead of 500 errors
 */

// Types
interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  error?: string;
}

interface ResponseOptions {
  status?: number;
  cacheMaxAge?: number;
}

// Constants
const FETCH_TIMEOUT_MS = 5000;
const CACHE_SUCCESS_SECONDS = 300; // 5 minutes
const CACHE_ERROR_SECONDS = 60; // 1 minute
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;
const USER_AGENT = 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://dither.chat)';

// Response helpers
function createJsonResponse(
  data: LinkMetadata | { error: string },
  options: ResponseOptions = {},
): Response {
  const { status = 200, cacheMaxAge = CACHE_SUCCESS_SECONDS } = options;

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
    },
  });
}

function createErrorResponse(
  error: string,
  url?: string,
  status: number = 200,
): Response {
  return createJsonResponse(
    { error, ...(url && { url }) },
    { status, cacheMaxAge: CACHE_ERROR_SECONDS },
  );
}

function createClientErrorResponse(error: string): Response {
  return createJsonResponse({ error }, { status: 400 });
}

// URL validation
function validateUrl(url: string): { success: true; url: URL } | { success: false; error: string } {
  try {
    const parsedUrl = new URL(url);

    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as typeof ALLOWED_PROTOCOLS[number])) {
      return { success: false, error: 'Invalid URL protocol' };
    }

    return { success: true, url: parsedUrl };
  } catch {
    return { success: false, error: 'Invalid URL format' };
  }
}

// Fetch with timeout
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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

// Error handling
function handleFetchError(error: unknown, url: string): Response {
  if (error instanceof Error && error.name === 'AbortError') {
    return createErrorResponse('Request timeout', url);
  }
  return createErrorResponse('Network error: Unable to reach the URL', url);
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

/**
 * Safely extracts HTML content from response, returning error response on failure.
 */
async function extractHtmlContent(
  response: Response,
  baseUrl: URL,
): Promise<{ success: true; html: string } | { success: false; response: Response }> {
  try {
    const html = await response.text();
    return { success: true, html };
  } catch {
    return {
      success: false,
      response: createErrorResponse('Failed to read page content', baseUrl.href),
    };
  }
}

// Metadata extraction
/**
 * Extracts meta tag content, handling both property and name attributes.
 * Supports flexible attribute order (property/name can come before or after content).
 */
function extractMetaTag(
  html: string,
  property: string,
  attribute: 'property' | 'name' = 'property',
): string | undefined {
  // Pattern handles: <meta property="..." content="..."> or <meta content="..." property="...">
  // Also handles single or double quotes and flexible whitespace
  const patterns = [
    // attribute before content
    new RegExp(
      `<meta[^>]+${attribute}=["']${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']+)["']`,
      'i',
    ),
    // content before attribute
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
      'i',
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

/**
 * Extracts Open Graph meta tags, trying property="og:X" first, then name="X" as fallback.
 */
function extractOgMeta(html: string, property: string): string | undefined {
  return extractMetaTag(html, `og:${property}`, 'property')
    || extractMetaTag(html, property, 'name');
}

/**
 * Extracts Twitter meta tags, checking both name and property attributes.
 */
function extractTwitterMeta(html: string, property: string): string | undefined {
  return extractMetaTag(html, `twitter:${property}`, 'name')
    || extractMetaTag(html, `twitter:${property}`, 'property');
}

function extractTitle(html: string): string | undefined {
  return extractOgMeta(html, 'title')
    || extractTwitterMeta(html, 'title')
    || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
}

function extractDescription(html: string): string | undefined {
  return extractOgMeta(html, 'description')
    || extractTwitterMeta(html, 'description')
    || extractMetaTag(html, 'description', 'name');
}

function extractImage(html: string, baseUrl: URL): string | undefined {
  const image = extractOgMeta(html, 'image')
    || extractTwitterMeta(html, 'image');

  if (!image) return undefined;

  // Resolve relative URLs
  if (!image.startsWith('http')) {
    try {
      return new URL(image, baseUrl.origin).href;
    } catch {
      return image; // Keep original if resolution fails
    }
  }

  return image;
}

/**
 * Builds metadata object with conditional error field if no metadata found.
 */
function buildMetadata(
  title: string | undefined,
  description: string | undefined,
  image: string | undefined,
  siteName: string | undefined,
  url: string,
): LinkMetadata {
  const hasMetadata = !!(title || description || image);

  return {
    url,
    ...(title && { title }),
    ...(description && { description }),
    ...(image && { image }),
    ...(siteName && { siteName }),
    ...(!hasMetadata && { error: 'No metadata found on this page' }),
  };
}

function extractMetadata(html: string, baseUrl: URL): LinkMetadata {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const image = extractImage(html, baseUrl);
  const siteName = extractOgMeta(html, 'site_name');

  return buildMetadata(title, description, image, siteName, baseUrl.href);
}

/**
 * Validates and processes the fetched response, extracting metadata.
 */
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
  return createJsonResponse(metadata);
}

/**
 * Handles the main request processing flow.
 */
async function handleRequestProcessing(
  targetUrl: string,
  parsedUrl: URL,
): Promise<Response> {
  try {
    const response = await fetchWithTimeout(targetUrl);
    return await processResponse(response, parsedUrl);
  } catch (error) {
    if (error instanceof Error) {
      return handleFetchError(error, parsedUrl.href);
    }

    console.error('Error in link-meta:', error);
    return createErrorResponse('Failed to process metadata', parsedUrl.href);
  }
}

// Main handler
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
