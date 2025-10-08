import crypto from 'node:crypto';

import type * as T from '../types/index';

import { sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { useConfig } from '../config';

const { AUTH, DISCORD_WEBHOOK_URL } = useConfig();

export function getTransferMessage(messages: Array<T.MsgGeneric>) {
    const msgTransfer = messages.find(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');
    if (!msgTransfer) {
        return null;
    }

    return msgTransfer as T.MsgTransfer;
}

export function getTransferQuantities(messages: Array<T.MsgGeneric>, denom = 'uatone') {
    const msgTransfers = messages.filter(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend') as T.MsgTransfer[];
    let amount = BigInt('0');

    for (const msg of msgTransfers) {
        for (const quantity of msg.amount) {
            if (quantity.denom !== denom) {
                continue;
            }

            amount += BigInt(quantity.amount);
        }
    }

    return amount.toString();
}

export function isReaderAuthorizationValid(headers: Record<string, string | undefined>) {
    if (!headers['authorization']) {
        return false;
    }

    try {
        const authHeaderBuffer = Buffer.from(headers['authorization'], 'utf8');
        const authSecretBuffer = Buffer.from(AUTH, 'utf8');
        if (authHeaderBuffer.length !== authSecretBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(authHeaderBuffer, authSecretBuffer);
    }
    catch (error) {
        console.error('Error during authorization validation:', error);
        return false;
    }
}

export async function getJsonbArrayCount(hash: string, tableName: string) {
    const result = await getDatabase().execute(sql`
        SELECT jsonb_array_length(data)::integer AS array_count
        FROM ${tableName}
        WHERE hash = ${hash}
        `);

    return result.rows.length > 0 ? result.rows[0].array_count : 0;
}

export function getRequestIP(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    const flyClientIP = request.headers.get('fly-client-ip');
    if (flyClientIP) {
        return flyClientIP;
    }

    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
        return cfIp;
    }

    // We'll just default to `host` if not found
    return request.headers.get('host') ?? 'localhost:3000';
}

export async function postToDiscord(content: string, url: string) {
    if (DISCORD_WEBHOOK_URL == '') {
        console.log(`DISCORD_WEBHOOK_URL was not provided.`);
        return;
    }

    const payload = {
        content: '',
        username: 'dither.chat',
        embeds: [
            {
                title: 'New Activity',
                description: content,
                color: 3447003,
                url,
            },
        ],
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log('Discord webhook message sent successfully! 🎉');
        }
        else {
            console.error(`Failed to send Discord message. Status: ${response.status}`);
            const errorText = await response.text();
            console.error('Response body:', errorText);
        }
    }
    catch (error) {
        console.error('An error occurred during the fetch request:', error);
    }
}
