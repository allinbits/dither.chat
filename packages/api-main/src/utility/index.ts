import { sql } from 'drizzle-orm';
import * as T from '../types/index';
import { db } from '../../drizzle/db';

export function getTransferMessage(messages: Array<T.MsgGeneric>) {
    const msgTransfer = messages.find((msg) => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');
    if (!msgTransfer) {
        return null;
    }

    return msgTransfer as T.MsgTransfer;
}

export function getTransferQuantities(messages: Array<T.MsgGeneric>, denom = 'uatone') {
    const msgTransfers = messages.filter((msg) => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend') as T.MsgTransfer[];
    let amount = BigInt('0');

    for (let msg of msgTransfers) {
        console.log(msg);

        for (let quantity of msg.amount) {
            if (quantity.denom !== denom) {
                continue;
            }

            amount += BigInt(quantity.amount);
        }
    }

    return amount.toString();
}

export async function getJsonbArrayCount(hash: string, tableName: string) {
    const result = await db.execute(sql`
        SELECT jsonb_array_length(data)::integer AS array_count
        FROM ${tableName}
        WHERE hash = ${hash}
        `);

    return result.rows.length > 0 ? result.rows[0].array_count : 0;
}

export function hexToUint8Array(hex: string) {
    if (hex.length % 2 !== 0) {
        throw new Error('Input hex string must have an even length');
    }
    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
        result.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return result;
}

export function uint8ArrayToHex(uint8Array: number[]) {
    return Array.from(uint8Array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}
