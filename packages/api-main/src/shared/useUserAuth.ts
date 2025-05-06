import { createHash, randomBytes } from 'crypto';

import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import jwt from 'jsonwebtoken';

type UserRequest = { message: string; timestamp: number; address: string; nonce: string };

const expirationTime = 60_000 * 5;
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
        if (Date.now() < requests[key].timestamp + expirationTime) {
            continue;
        }

        delete requests[key];
    }
}

export function useUserAuth() {
    const add = (publicKey: string) => {
        const nonce = randomBytes(16).toString('hex');
        const dataSet = {
            message: 'Dither Login',
            timestamp: Date.now(),
            address: publicKey,
            nonce,
        };

        requests[publicKey + nonce] = dataSet;
        return { nonce, message: createHash('sha256').update(JSON.stringify(dataSet)).digest('hex') };
    };

    const verify = (publicKey: string, signature: string, nonce: string) => {
        const publicAddress = getSignerAddressFromPublicKey(publicKey, 'atone');
        const requestIdentifier = publicAddress + nonce;

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

        if (Date.now() > tempData.timestamp + expirationTime) {
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
