import jwt from 'jsonwebtoken';

import { useConfig } from '../config';

const { JWT } = useConfig();

export const verifyJWT = async (token: string | undefined) => {
    if (!token) {
        return undefined;
    }

    try {
        const tokenData = jwt.verify(token, JWT) as { data: string; iat: number; exp: number };
        if (!tokenData) {
            return undefined;
        }

        // token data is on the form Login,id,date,publicKey,nonce
        // so to obtain the user address we need to split on the comma
        // and take the 4th element
        return tokenData.data.split(',')[2]; // Returns user address
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
};
