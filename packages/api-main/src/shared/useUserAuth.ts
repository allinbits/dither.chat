import { createHash } from 'crypto';

import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import jwt from 'jsonwebtoken';

type UserRequest = { publicKey: string; expiration: number };

const requests: { [publicKey: string]: UserRequest } = {};
const secretKey = 'temp-key-need-to-config-this';

function getSignerAddressFromPublicKey(publicKeyBase64: string, prefix: string = 'cosmos'): string {
    const publicKeyBytes = fromBase64(publicKeyBase64);
    const secp256k1Pubkey = encodeSecp256k1Pubkey(publicKeyBytes);
    return pubkeyToAddress(secp256k1Pubkey, prefix);
}

function cleanupRequests() {
    if (Object.values(requests).length <= 0) {
        return;
    }

    for (const key of Object.keys(requests)) {
        if (Date.now() < requests[key].expiration) {
            continue;
        }

        delete requests[key];
    }
}

export function useUserAuth() {
    const add = (publicKey: string) => {
        const dataSet = {
            publicKey,
            expiration: Date.now() + 60_000 * 3,
        };

        const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        requests[publicKey + String(nonce)] = dataSet;
        return { nonce, message: createHash('sha256').update(JSON.stringify(dataSet)).digest('hex') };
    };

    const verify = (publicKey: string, signature: string, nonce: number) => {
        const publicAddress = getSignerAddressFromPublicKey(publicKey, 'atone');
        const requestIdentifier = publicAddress + String(nonce);

        if (!requests[requestIdentifier]) {
            cleanupRequests();
            return { status: 401, error: 'no available requests found' };
        }

        const tempData = { ...requests[requestIdentifier] };
        delete requests[requestIdentifier];

        const message = createHash('sha256').update(JSON.stringify(tempData)).digest('hex');
        const didVerify = verifyADR36Amino(
            'atone',
            publicAddress,
            message,
            fromBase64(publicKey),
            fromBase64(signature),
        );

        if (!didVerify) {
            cleanupRequests();
            return { status: 401, error: 'failed to verify request from public key' };
        }

        if (Date.now() > tempData.expiration) {
            cleanupRequests();
            return { status: 401, error: 'request expired' };
        }

        return { status: 200, bearer: jwt.sign(tempData, secretKey, { expiresIn: '24h' }) };
    };

    return {
        add,
        verify,
    };
}
