import jwt from 'jsonwebtoken';

import { secretKey } from './useUserAuth';

export const verifyJWT = async ({ request, store }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return { status: 401, error: 'Unauthorized: No token' };
    }

    const token = authHeader.split(' ')[1];
    const tokenData = await jwt.verify(token, secretKey);

    if (!tokenData) {
        return { status: 401, error: 'Unauthorized: Invalid token' };
    }
    // token data is on the form Login,id,date,publicKey,nonce
    // so to obtain the user address we need to split on the comma
    // and take the 4th element
    const userAddress = tokenData.data.split(',')[3];
    store.userAddress = userAddress;
};
