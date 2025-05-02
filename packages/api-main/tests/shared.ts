import { createHash, randomBytes } from 'crypto';
import { bech32 } from 'bech32';

let lastHeight = 1_000_000;

export async function get<T>(endpoint: string, port: 'WRITE' | 'READ' = 'READ') {
    const response = await fetch(`http://localhost:${port === 'WRITE' ? 3001 : 3000}/v1/${endpoint}`).catch((err) => {
        console.error(err);
        return null;
    });

    if (!response?.ok) {
        return null;
    }

    const jsonData = await response.json();
    return jsonData as T;
}

export async function post<T = { status: number }>(endpoint: string, body: any, port: 'WRITE' | 'READ' = 'WRITE') {
    const response = await fetch(`http://localhost:${port === 'WRITE' ? 3001 : 3000}/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body }),
    }).catch((err) => {
        console.error(err);
        return null;
    });

    if (!response?.ok) {
        console.log(await response?.json());
        return null;
    }

    const jsonData = await response.json() as { status: number };
    if (jsonData.status && jsonData.status !== 200) {
        return jsonData;
    }

    return jsonData as T;
}

export function getSha256Hash(input: string): string {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

export function getAtomOneAddress(): string {
    const randomData = randomBytes(32);
    const hash = createHash('sha256').update(randomData).digest();
    const addressBytes = hash.slice(0, 20);
    const encodedAddress = bech32.encode('atone', bech32.toWords(addressBytes));
    return encodedAddress;
}

export function getRandomHash() {
    return getSha256Hash(randomBytes(256).toString());
}

export function generateFakeData(memo: string, from_address: string, to_address: string) {
    lastHeight++;

    return {
        hash: getSha256Hash(randomBytes(256).toString()),
        height: lastHeight.toString(),
        timestamp: '2025-04-16T19:46:42Z', // Doesn't matter, just need to store some timestamps
        memo,
        messages: [
            {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: from_address,
                to_address: to_address,
                amount: [{ denom: 'uatone', amount: '1' }],
            },
        ],
    };
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}