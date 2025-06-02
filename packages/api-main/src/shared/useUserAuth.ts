import { randomBytes } from 'crypto';

import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import jwt from 'jsonwebtoken';

const expirationTime = 60_000 * 5;
const requests: { [publicKey: string]: string } = {};
export const secretKey = 'temp-key-need-to-config-this';

let id = 0;

function getSignerAddressFromPublicKey(publicKeyBase64: string, prefix: string = 'atone'): string {
    const publicKeyBytes = fromBase64(publicKeyBase64);
    const secp256k1Pubkey = encodeSecp256k1Pubkey(publicKeyBytes);
    return pubkeyToAddress(secp256k1Pubkey, prefix);
}

function getTimestamp(msg: string) {
    const [_msg, _id, timestamp, _key, _nonce] = msg.split(',');
    return parseFloat(timestamp);
}

function cleanupRequests() {
    if (Object.values(requests).length <= 0) {
        return;
    }

    for (const key of Object.keys(requests)) {
        const timestamp = getTimestamp(requests[key]);
        if (Date.now() < timestamp + expirationTime) {
            continue;
        }

        delete requests[key];
    }
}

export function useUserAuth() {
    /**
     * Simply creates an authentication request for a specific key.
     * It is a time-locked request with a unique identifier.
     *
     * @param {string} publicKey
     * @return {*}
     */
    const add = (publicKey: string) => {
        const nonce = randomBytes(16).toString('hex');
        const identifier = id;

        let signableMessage = '';

        // [msg, id, timestamp, key, nonce]
        signableMessage += 'Login,';
        signableMessage += `${id},`;
        signableMessage += `${Date.now()},`;
        signableMessage += `${publicKey},`;
        signableMessage += `${nonce}`;

        requests[publicKey + id] = signableMessage;
        id++;

        return { id: identifier, message: signableMessage };
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
    const verifyAndCreate = (publicKey: string, signature: string, id: number) => {
        const publicAddress = getSignerAddressFromPublicKey(publicKey, 'atone');
        const requestIdentifier = publicAddress + id;

        if (!requests[requestIdentifier]) {
            cleanupRequests();
            return { status: 401, error: 'no available requests found' };
        }

        const originalMessage = requests[requestIdentifier];
        delete requests[requestIdentifier];
        const didVerify = verifyADR36Amino(
            'atone',
            publicAddress,
            originalMessage,
            fromBase64(publicKey),
            fromBase64(signature),
            'secp256k1',
        );

        if (!didVerify) {
            cleanupRequests();
            return { status: 401, error: 'failed to verify request from public key' };
        }

        const timestamp = getTimestamp(originalMessage);
        if (Date.now() > timestamp + expirationTime) {
            cleanupRequests();
            return { status: 401, error: 'request expired' };
        }

        return { status: 200, bearer: jwt.sign({ data: originalMessage }, secretKey, { expiresIn: '3d' }) };
    };

    return {
        add,
        verifyAndCreate,
    };
}
