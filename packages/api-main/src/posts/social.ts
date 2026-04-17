import type { Posts } from '@atomone/dither-api-types';

import { getDatabase } from '../../drizzle/db';
import { SocialLinksTable } from '../../drizzle/schema';
import { verifyLink } from '../social/verify';
import { SOCIAL_LINK_STATUS } from '../types/social-link';

export async function SocialProof(body: Posts.SocialProofBody) {
  if (body.hash.length !== 64) {
    return { status: 400, error: 'Provided hash is not valid' };
  }

  if (body.from.length !== 44) {
    return { status: 400, error: 'Provided from address is not valid' };
  }

  if (!body.username || body.username.trim().length === 0) {
    return { status: 400, error: 'username is required' };
  }

  if (!body.platform || body.platform.trim().length === 0) {
    return { status: 400, error: 'platform is required' };
  }

  if (!body.proof_url || body.proof_url.trim().length === 0) {
    return { status: 400, error: 'proof_url is required' };
  }

  // handle stored as "username@platform"
  const handle = `${body.username.toLowerCase()}@${body.platform.toLowerCase()}`;

  let insertedId: number;

  try {
    const [inserted] = await getDatabase()
      .insert(SocialLinksTable)
      .values({
        hash: body.hash.toLowerCase(),
        address: body.from.toLowerCase(),
        handle,
        platform: body.platform.toLowerCase(),
        status: SOCIAL_LINK_STATUS.PENDING,
        proof_url: body.proof_url,
        created_at: new Date(body.timestamp),
      })
      .returning({ id: SocialLinksTable.id });

    if (!inserted) {
      return { status: 500, error: 'failed to insert social link record' };
    }

    insertedId = inserted.id;
  } catch (err) {
    console.error(err);
    return { status: 500, error: 'failed to communicate with database' };
  }

  // Verification runs in background, we don't want to block the API response.
  // Future improvement: if we had a job queue system, we could push a job here instead of this.
  verifyLink(insertedId, body.platform.toLowerCase(), body.proof_url, body.from.toLowerCase(), body.username.toLowerCase()).catch(
    err => console.error(`verifySocialLink error for id=${insertedId}:`, err),
  );

  return { status: 200 };
}
