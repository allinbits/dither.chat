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

export async function getJsonbArrayCount(hash: string, tableName: string) {
    const result = await db.execute(sql`
        SELECT jsonb_array_length(data)::integer AS array_count
        FROM ${tableName}
        WHERE hash = ${hash}
        `);

    return result.rows.length > 0 ? result.rows[0].array_count : 0;
}
