import process from 'node:process';

import { getSocialProofCode } from '../code';

interface GitHubGistFile {
  filename?: string;
  type?: string;
  language?: string | null;
  raw_url?: string;
  size?: number;
  truncated?: boolean;
  content?: string;
}

interface GitHubGistResponse {
  id?: string;
  owner?: {
    login?: string;
  } | null;
  files?: Record<string, GitHubGistFile>;
}

const GITHUB_API_VERSION = '2022-11-28';
const REQUIRED_PROOF_FILE = 'dither.md';

export async function verifyGitHubGist(
  proofUrl: string,
  address: string,
  claimedUsername: string,
): Promise<boolean> {
  const gistId = extractGistId(proofUrl);
  if (!gistId) {
    throw new Error(`Cannot extract gist ID from proof URL: ${proofUrl}`);
  }

  const gist = await fetchGist(gistId);
  const gistOwnerUsername = gist.owner?.login;
  const proofFile = gist.files?.[REQUIRED_PROOF_FILE];

  const authorMatches = gistOwnerUsername?.toLowerCase() === claimedUsername.toLowerCase();
  if (!authorMatches || !proofFile) {
    return false;
  }

  const proofContent = await readGistFileContent(proofFile);
  const expectedCode = getSocialProofCode(address);
  const codePresent = proofContent.includes(expectedCode);

  return codePresent;
}

async function fetchGist(gistId: string): Promise<GitHubGistResponse> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: buildGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
  }

  return await response.json() as GitHubGistResponse;
}

async function readGistFileContent(file: GitHubGistFile): Promise<string> {
  if (typeof file.content === 'string' && !file.truncated) {
    return file.content;
  }

  // GitHub can truncate file content in GET /gists/{id}, so fallback to raw_url only in that case.
  if (!file.raw_url) {
    return file.content ?? '';
  }

  const response = await fetch(file.raw_url, {
    headers: buildGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GitHub raw gist fetch returned ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'dither-chat-verifier',
  };

  const token = process.env.GITHUB_BEARER_TOKEN;
  if (!token) {
    throw new Error('GITHUB_BEARER_TOKEN environment variable is not set');
  }

  headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Expected format:
 * - https://gist.github.com/username/gistid
 */
function extractGistId(proofUrl: string): string | null {
  try {
    const url = new URL(proofUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'gist.github.com') {
      return null;
    }

    const segments = url.pathname
      .split('/')
      .filter(Boolean);

    if (segments.length !== 2) return null;
    const gistId = segments[1] ?? '';
    return gistId.length > 0 ? gistId : null;
  } catch {
    return null;
  }
}
