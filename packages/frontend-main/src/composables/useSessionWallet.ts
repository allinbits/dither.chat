import { ref } from 'vue';
import { AminoTypes, createAuthzAminoConverters, createFeegrantAminoConverters, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { consoleLogger, newSessionSigner, type SessionSigner } from 'stint-signer';

import { useWallet } from './useWallet';

import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletStateStore } from '@/stores/useWalletStateStore';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

const sessionSigner = ref<SessionSigner>();
const hasGrants = ref(false);

export const useSessionWallet = () => {
    const configStore = useConfigStore();
    const chainInfo = getChainConfigLazy();
    const destinationWallet = configStore.envConfig.communityWallet ?? 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep';
    const walletState = useWalletStateStore();
    const { signer } = useWallet();

    const clearSession = async () => {
        if (!sessionSigner.value || !signer.value) {
            return;
        }

        const messages = sessionSigner.value.revokeDelegationMessages();
        const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value, {
            gasPrice: GasPrice.fromString('0.025uphoton'),
        });
        await client.signAndBroadcastSync(sessionSigner.value.primaryAddress(), messages, 'auto');

        sessionSigner.value = undefined;
        hasGrants.value = false;
        walletState.isUsingSingleSession = false;
    };

    const createSession = async () => {
        hasGrants.value = false;

        if (!signer.value) {
            return;
        }

        if (sessionSigner.value) {
            sessionSigner.value = undefined;
            return;
        }

        const aminoTypes = new AminoTypes({ ...createAuthzAminoConverters(), ...createFeegrantAminoConverters() });
        const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value, {
            gasPrice: GasPrice.fromString('0.025uphoton'),
            aminoTypes,
        });

        const stintSigner = await newSessionSigner({ primaryClient: client as never, saltName: 'dither-session', logger: consoleLogger });
        const primaryAddress = stintSigner.primaryAddress();
        let existingAuthz = await stintSigner.hasAuthzGrant();
        let existingFeeGrant = await stintSigner.hasFeegrant();

        if (!existingAuthz || !existingFeeGrant) {
            const messages = stintSigner.generateDelegationMessages({
                sessionExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
                spendLimit: { denom: 'uphoton', amount: String(1_000_000) }, // 1 PHOTON
                gasLimit: { denom: 'uphoton', amount: String(500_000) }, // 0.5 PHOTON,
                allowedRecipients: [destinationWallet],
            });

            await client.signAndBroadcastSync(primaryAddress, messages, 'auto');
        }

        existingAuthz = await stintSigner.hasAuthzGrant();
        existingFeeGrant = await stintSigner.hasFeegrant();

        if (existingAuthz && existingFeeGrant) {
            hasGrants.value = true;
            sessionSigner.value = stintSigner;
            walletState.isUsingSingleSession = true;
        }
    };

    return {
        clearSession,
        createSession,
        sessionSigner,
        hasGrants,
    };
};
