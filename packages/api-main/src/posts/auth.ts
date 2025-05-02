import { t } from 'elysia';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
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
        const result = verifyADR36Amino('atone', getSignerAddressFromPublicKey(body.pub_key.value, 'atone'), 'hello', fromBase64(body.pub_key.value), fromBase64(body.signature));
        return { status: 200, result };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
