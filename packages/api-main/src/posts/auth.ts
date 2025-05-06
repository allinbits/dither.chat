import { t } from 'elysia';

import { useUserAuth } from '../shared/useUserAuth';

export const AuthBody = t.Object({
    pub_key: t.Object({ type: t.String(), value: t.String() }),
    signature: t.String(),
    nonce: t.Number(),
});

// Example Body
//
// Example message was: 'hello'
//
// {
//     "pub_key": {
//         "type": "tendermint/PubKeySecp256k1",
//         "value": "Apkkr+4m3APojC7FX2ZdGdCx0WsGAIFhgC899J1akk+n"
//     },
//     "signature": "OPKML9/z6QQJMPsrxQniqQqXQbdKqHMCzdjtU66qQOkpbkvhMK+KHsrOg5J1DoZiPb7Ix0jU2TvVJOhBValtZQ=="
// }

const { verify } = useUserAuth();

export async function Auth(body: typeof AuthBody.static) {
    try {
        const result = verify(body.pub_key.value, body.signature, body.nonce);
        return { status: 200, result };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
