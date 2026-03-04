import process from 'node:process';

import { and, eq, ne } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { SocialLinksTable } from '../../drizzle/schema';
import { SOCIAL_LINK_ERROR_REASON, SOCIAL_LINK_STATUS } from '../types/social-link';
import { verifyGitHubGist } from './providers/github';
import { verifyXTweet } from './providers/x';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000; // 2 seconds, doubles each retry
const STATUS_VERIFIED = SOCIAL_LINK_STATUS.VERIFIED;
const STATUS_FAILED = SOCIAL_LINK_STATUS.FAILED;
const ERROR_REASON_PROOF_MISMATCH = SOCIAL_LINK_ERROR_REASON.PROOF_MISMATCH;
const ERROR_REASON_VERIFICATION_FAILED = SOCIAL_LINK_ERROR_REASON.VERIFICATION_FAILED;
const ERROR_REASON_HANDLE_ALREADY_CLAIMED = SOCIAL_LINK_ERROR_REASON.HANDLE_ALREADY_CLAIMED;

/**
 * Fetches the proof link, verifies it according to the platform, and updates the DB record with the result.
 * Never throws — all errors are caught and result in a 'failed' DB update.
 */
export async function verifyLink(
  id: number,
  platform: string,
  proofUrl: string,
  address: string,
  username: string,
): Promise<void> {
  // Dev bypass: skip external verification and immediately mark as verified.
  // Set SKIP_SOCIAL_VERIFICATION=true in .env to enable.
  if (process.env.SKIP_SOCIAL_VERIFICATION === 'true') {
    if (await isHandleAlreadyClaimed(username, platform, id)) {
      await getDatabase()
        .update(SocialLinksTable)
        .set({ status: STATUS_FAILED, error_reason: ERROR_REASON_HANDLE_ALREADY_CLAIMED })
        .where(eq(SocialLinksTable.id, id));
      return;
    }

    await getDatabase()
      .update(SocialLinksTable)
      .set({ status: STATUS_VERIFIED, error_reason: null })
      .where(eq(SocialLinksTable.id, id));
    return;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Retry with exponential delay
    if (attempt > 0) {
      const delayMs = INITIAL_DELAY_MS * 2 ** (attempt - 1);
      await sleep(delayMs);
    }

    try {
      const verified = await verifyWithProvider(platform, proofUrl, address, username);

      if (verified) {
        if (await isHandleAlreadyClaimed(username, platform, id)) {
          await getDatabase()
            .update(SocialLinksTable)
            .set({ status: STATUS_FAILED, error_reason: ERROR_REASON_HANDLE_ALREADY_CLAIMED })
            .where(eq(SocialLinksTable.id, id));
          return;
        }

        await getDatabase()
          .update(SocialLinksTable)
          .set({ status: STATUS_VERIFIED, error_reason: null })
          .where(eq(SocialLinksTable.id, id));
        return;
      }

      // Proof check failed (wrong author or missing code) — no point retrying
      await getDatabase()
        .update(SocialLinksTable)
        .set({
          status: STATUS_FAILED,
          error_reason: ERROR_REASON_PROOF_MISMATCH,
        })
        .where(eq(SocialLinksTable.id, id));
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`verifyLink attempt ${attempt + 1}/${MAX_RETRIES} failed for id=${id}:`, lastError.message);
    }
  }

  // All retries exhausted — mark as failed
  try {
    await getDatabase()
      .update(SocialLinksTable)
      .set({
        status: STATUS_FAILED,
        error_reason: ERROR_REASON_VERIFICATION_FAILED,
      })
      .where(eq(SocialLinksTable.id, id));
  } catch (dbErr) {
    console.error(`verifyLink: failed to update DB to failed status for id=${id}:`, dbErr);
  }
}

/**
 * Selects the correct provider verify function based on platform.
 */
async function verifyWithProvider(
  platform: string,
  proofUrl: string,
  address: string,
  username: string,
): Promise<boolean> {
  switch (platform) {
    case 'x':
      return verifyXTweet(proofUrl, address, username);
    case 'github':
      return verifyGitHubGist(proofUrl, address, username);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Checks if the given handle is already claimed by another user (excluding the current record ID)
async function isHandleAlreadyClaimed(username: string, platform: string, excludeId: number): Promise<boolean> {
  const handle = `${username}@${platform}`;
  const existing = await getDatabase()
    .select({ id: SocialLinksTable.id })
    .from(SocialLinksTable)
    .where(
      and(
        eq(SocialLinksTable.handle, handle),
        eq(SocialLinksTable.platform, platform),
        eq(SocialLinksTable.status, STATUS_VERIFIED),
        ne(SocialLinksTable.id, excludeId),
      ),
    )
    .limit(1);
  return existing.length > 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
