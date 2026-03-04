import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSocialProofCode } from '../src/social/code';
import { verifyGitHubGist } from '../src/social/providers/github';

const address = 'atone1qgdjh6zvzzc8gv3fzk0mu9mezh6gan9hsaxyz1';
const username = 'dither';
const gistId = 'abcdef1234567890';
const proofUrl = `https://gist.github.com/${username}/${gistId}`;
const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function textResponse(body: string, status = 200) {
  return new Response(body, { status });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('verifyGitHubGist', () => {
  it('verifies when owner matches and dither.md contains proof code', async () => {
    const proofCode = getSocialProofCode(address);
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      owner: { login: username },
      files: {
        'dither.md': {
          filename: 'dither.md',
          truncated: false,
          content: `verification: ${proofCode}`,
        },
      },
    }));

    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(proofUrl, address, username)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://api.github.com/gists/${gistId}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      }),
    );
  });

  it('returns false when gist owner does not match claimed username', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      owner: { login: 'bob' },
      files: {
        'dither.md': {
          truncated: false,
          content: `verification: ${getSocialProofCode(address)}`,
        },
      },
    }));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(proofUrl, address, username)).resolves.toBe(false);
  });

  it('returns false when dither.md is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      owner: { login: username },
      files: {
        'readme.md': {
          truncated: false,
          content: `verification: ${getSocialProofCode(address)}`,
        },
      },
    }));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(proofUrl, address, username)).resolves.toBe(false);
  });

  it('fetches raw_url when dither.md content is truncated', async () => {
    const proofCode = getSocialProofCode(address);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        owner: { login: username },
        files: {
          'dither.md': {
            filename: 'dither.md',
            truncated: true,
            content: 'partial...',
            raw_url: `https://gist.githubusercontent.com/${username}/${gistId}/raw/dither.md`,
          },
        },
      }))
      .mockResolvedValueOnce(textResponse(`full content ${proofCode}`));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(proofUrl, address, username)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `https://gist.githubusercontent.com/${username}/${gistId}/raw/dither.md`,
      expect.any(Object),
    );
  });

  it('rejects invalid proof URL format', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(`https://gist.github.com/${gistId}`, address, username))
      .rejects
      .toThrow('Cannot extract gist ID');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when GitHub API returns non-200', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ message: 'not found' }, 404));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(verifyGitHubGist(proofUrl, address, username)).rejects.toThrow('GitHub API returned 404');
  });
});
