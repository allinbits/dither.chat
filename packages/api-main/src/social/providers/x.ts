import process from 'node:process';

import { getSocialProofCode } from '../code';

interface XTweetResponse {
  data?: {
    id: string;
    text: string;
    author_id: string;
  };
  includes?: {
    users: Array<{
      id: string;
      name: string;
      username: string;
    }>;
  };
  errors?: Array<{ message: string }>;
}

export async function verifyXTweet(proofUrl: string, address: string, claimedUsername: string): Promise<boolean> {
  const tweetId = extractTweetId(proofUrl);
  if (!tweetId) {
    throw new Error(`Cannot extract tweet ID from proof URL: ${proofUrl}`);
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error('X_BEARER_TOKEN environment variable is not set');
  }

  const url = `https://api.x.com/2/tweets/${tweetId}?expansions=author_id&user.fields=username`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as XTweetResponse;

  if (!data.data || !data.includes?.users?.[0]) {
    throw new Error(`X API response missing expected fields for tweet ${tweetId}`);
  }

  const tweetAuthorUsername = data.includes.users[0].username;
  const tweetText = data.data.text;
  const expectedCode = getSocialProofCode(address);

  const authorMatches = tweetAuthorUsername.toLowerCase() === claimedUsername.toLowerCase();
  const codePresent = tweetText.includes(expectedCode);

  return authorMatches && codePresent;
}

/**
 * Extracts tweet ID from a proof URL.
 * Expected format: https://x.com/username/status/1234567890
 */
function extractTweetId(proofUrl: string): string | null {
  const match = proofUrl.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}
