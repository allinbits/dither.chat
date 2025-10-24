import { isReaderAuthorizationValid } from '../utility';

/**
 * Middleware to validate reader authorization header
 */
export function readerAuthMiddleware(context: { headers: Record<string, string | undefined> }) {
  if (!isReaderAuthorizationValid(context.headers)) {
    return { status: 401, error: 'Unauthorized to make write request' };
  }
}
