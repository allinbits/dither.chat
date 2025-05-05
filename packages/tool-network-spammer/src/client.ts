import type { DeliverTxResponse } from '@cosmjs/stargate';

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import dotenv from 'dotenv';
dotenv.config();

const mnemonics = JSON.parse(process.env.MNEMONICS!);
const rpcEndpoint = process.env.RPC_ENDPOINT || '';
const receiverAddress = 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep';

if (!rpcEndpoint) {
    throw new Error('RPC_ENDPOINT not found in .env');
}

if (!mnemonics || mnemonics.length === 0) {
    throw new Error('MNEMONICS_JSON not found in .env');
}

export async function getClients() {
    const clients = [];
    for (const mnemonic of mnemonics) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: 'atone',
        });

        const [firstAccount] = await wallet.getAccounts();

        const client = await SigningStargateClient.connectWithSigner(
            rpcEndpoint,
            wallet,
        );
        clients.push({ client, address: firstAccount.address });
    }

    return clients;
}

export type spammerClient = {
    client: SigningStargateClient;
    address: string;
};

export async function sendMemo(
    spammer: spammerClient,
    memo: string,
): Promise<DeliverTxResponse | undefined> {
    try {
        const fee = {
            amount: [{ denom: 'uphoton', amount: '500' }],
            gas: '200000',
        };

        const result = await spammer.client.sendTokens(
            spammer.address,
            receiverAddress,
            [{ denom: 'uatone', amount: '1' }],
            fee,
            memo,
        );
        return result;
    }
    catch (err) {
        console.error('[tx] Error:', err);
    }
}
