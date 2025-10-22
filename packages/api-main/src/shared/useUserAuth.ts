import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';

import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { eq, lt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { getDatabase } from '../../drizzle/db';
import { AuthRequests } from '../../drizzle/schema';
import { useConfig } from '../config';

const { JWT } = useConfig();

const expirationTime = 60_000 * 5;

function getSignerAddressFromPublicKey(publicKeyBase64: string, prefix: string = 'atone'): string {
  const publicKeyBytes = new Uint8Array(Buffer.from(publicKeyBase64, 'base64'));
  const secp256k1Pubkey = encodeSecp256k1Pubkey(publicKeyBytes);
  return pubkeyToAddress(secp256k1Pubkey, prefix);
}

async function cleanupRequests() {
  const epoch = new Date(Date.now());
  await getDatabase().delete(AuthRequests).where(lt(AuthRequests.timestamp, epoch)).execute();
}

export function useUserAuth() {
  /**
   * Simply creates an authentication request for a specific key.
   * It is a time-locked request with a unique identifier.
   *
   * @param {string} publicKey
   * @return {*}
   */
  const add = async (publicKey: string) => {
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Date.now() + expirationTime;

    let signableMessage = '';

    // [msg, timestamp, key, nonce]
    signableMessage += 'Login,';
    signableMessage += `${timestamp},`;
    signableMessage += `${publicKey},`;
    signableMessage += `${nonce}`;

    const rows = await getDatabase().insert(AuthRequests).values({ msg: signableMessage, timestamp: new Date(timestamp) }).returning();
    return { id: rows[0].id, message: signableMessage };
  };

  /**
   * How this works is that a user makes a request to authenticate.
   * They are given a message that needs to be signed.
   * In that message contains a timestamp with an expiration set 5 minutes in the future.
   * Additionally they are given an id for their request.
   *
   * When they authenticate, they sign the message with a wallet.
   * The signature and public key are passed up.
   * We used the public key and id to identify the data that was stored in-memory.
   * We take the signature bytes and verify it against the message that was signed.
   * We take the original message, apply the future time, and verify the timestamp is in the correct window.
   *
   * Finally, if everything is valid the data is cleaned up and can never be authenticated against again.
   * Additionally, during each failed attempt we go through and cleanup old login requests.
   *
   * @param {string} publicKey
   * @param {string} signature
   * @param {number} id
   * @return {*}
   */
  const verifyAndCreate = async (publicKey: string, signature: string, id: number) => {
    const publicAddress = getSignerAddressFromPublicKey(publicKey, 'atone');

    const rows = await getDatabase().select().from(AuthRequests).where(eq(AuthRequests.id, id)).limit(1).execute();
    if (rows.length <= 0) {
      cleanupRequests();
      return { status: 401, error: 'no available requests found' };
    }

    if (Date.now() > new Date(rows[0].timestamp).getTime()) {
      cleanupRequests();
      return { status: 401, error: 'request expired' };
    }

    const originalMessage = rows[0].msg;
    const didVerify = verifyADR36Amino(
      'atone',
      publicAddress,
      originalMessage,
      new Uint8Array(Buffer.from(publicKey, 'base64')),
      new Uint8Array(Buffer.from(signature, 'base64')),
      'secp256k1',
    );

    if (!didVerify) {
      console.warn(`Failed to Verify: ${publicAddress}, ${originalMessage}`);
      cleanupRequests();
      return { status: 401, error: 'failed to verify request from public key' };
    }

    await getDatabase().delete(AuthRequests).where(eq(AuthRequests.id, id)).returning();
    return { status: 200, bearer: jwt.sign({ data: rows[0].msg }, JWT, { expiresIn: '3d', algorithm: 'HS256' }) };
  };

  return {
    add,
    verifyAndCreate,
  };
}
