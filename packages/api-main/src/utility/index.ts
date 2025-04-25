import { sql } from 'drizzle-orm';
import * as T from '../types/index';
import { getDatabase } from '../../drizzle/db';

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
    const result = await getDatabase().execute(sql`
        SELECT jsonb_array_length(data)::integer AS array_count
        FROM ${tableName}
        WHERE hash = ${hash}
        `);

    return result.rows.length > 0 ? result.rows[0].array_count : 0;
}
