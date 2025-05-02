import { t } from 'elysia';
import { encodeSecp256k1Pubkey, Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding'
import { verifyADR36Amino } from '@keplr-wallet/cosmos';

export const AuthBody = t.Object({
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String()
});

function getSignerAddressFromPublicKey(publicKeyBase64: string, prefix: string = "cosmos"): string {
    const publicKeyBytes = fromBase64(publicKeyBase64);
    const secp256k1Pubkey = encodeSecp256k1Pubkey(publicKeyBytes);
    return pubkeyToAddress(secp256k1Pubkey, prefix);
}

async function verify(message: string, pubkey: Pubkey, signature: string) {
    try {
        return verifyADR36Amino('atone', getSignerAddressFromPublicKey(pubkey.value, 'atone'), message, fromBase64(pubkey.value), fromBase64(signature));
    } catch (err) {
        console.error(err);
        return false;
    }
}

// Example Body:
// {
//     "pub_key": {
//         "type": "tendermint/PubKeySecp256k1",
//         "value": "Apkkr+4m3APojC7FX2ZdGdCx0WsGAIFhgC899J1akk+n"
//     },
//     "signature": "OPKML9/z6QQJMPsrxQniqQqXQbdKqHMCzdjtU66qQOkpbkvhMK+KHsrOg5J1DoZiPb7Ix0jU2TvVJOhBValtZQ=="
// }

export async function Auth(body: typeof AuthBody.static) {
    try {
        // Stil need to build the system to verify this part correctly
        const result = await verify('hello', body.pub_key, body.signature);
        return { status: 200, result };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
