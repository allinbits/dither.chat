/**
 * Compresses hash to fit within Telegram's 64-byte callback_data limit.
 * @see https://core.telegram.org/bots/api#inlinekeyboardbutton
 */
export function compressHash(hash: string) {
    return Buffer.from(hash, 'hex').toString('base64url');
}

export function decompressHash(hash: string) {
    return Buffer.from(hash, 'base64url').toString('hex');
}
