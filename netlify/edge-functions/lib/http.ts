/**
 * HTTP response utilities for edge functions.
 */

export interface ResponseOptions {
  status?: number;
  cacheMaxAge?: number;
}

export const CACHE_SUCCESS_SECONDS = 300; // 5 minutes
export const CACHE_ERROR_SECONDS = 60; // 1 minute
export const CACHE_IMMUTABLE_SECONDS = 31536000; // 1 year

/**
 * Creates a JSON response with configurable status and cache headers.
 */
export function createJsonResponse<T>(
  data: T,
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

/**
 * Creates a text/HTML response with configurable status and cache headers.
 */
export function createTextResponse(
  body: string,
  contentType: string,
  options: ResponseOptions = {},
): Response {
  const { status = 200, cacheMaxAge = CACHE_SUCCESS_SECONDS } = options;

  const cacheControl = cacheMaxAge === CACHE_IMMUTABLE_SECONDS
    ? 'public, max-age=31536000, immutable'
    : `public, max-age=${cacheMaxAge}`;

  return new Response(body, {
    status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}

/**
 * Creates an error response with JSON body.
 * Returns 200 status by default for graceful degradation.
 */
export function createErrorResponse(
  error: string,
  url?: string,
  status: number = 200,
): Response {
  return createJsonResponse(
    { error, ...(url && { url }) },
    { status, cacheMaxAge: CACHE_ERROR_SECONDS },
  );
}

/**
 * Creates a client error response (400 status).
 */
export function createClientErrorResponse(error: string): Response {
  return createJsonResponse({ error }, { status: 400 });
}

/**
 * Creates a not found response (404 status).
 */
export function createNotFoundResponse(message: string = 'Not Found'): Response {
  return new Response(message, { status: 404 });
}

/**
 * Creates an internal server error response (500 status).
 */
export function createInternalErrorResponse(message: string = 'Internal Server Error'): Response {
  return new Response(message, { status: 500 });
}
