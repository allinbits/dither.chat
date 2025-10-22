import type { SessionSigner } from 'stint-signer';
import { AminoTypes, createAuthzAminoConverters, createFeegrantAminoConverters, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { consoleLogger, newSessionSigner } from 'stint-signer';
import { ref } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

import { useWalletStateStore } from '@/stores/useWalletStateStore';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';
import { useWallet } from './useWallet';

const sessionSigner = ref<SessionSigner>();
const hasGrants = ref(false);
const isUpdating = ref(false);

export function useSessionWallet() {
  const configStore = useConfigStore();
  const chainInfo = getChainConfigLazy();
  const destinationWallet = configStore.envConfig.communityWallet ?? 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep';
  const walletState = useWalletStateStore();
  const { signer } = useWallet();

  const clearSession = async () => {
    if (!sessionSigner.value || !signer.value) {
      return;
    }

    isUpdating.value = true;

    try {
      const messages = sessionSigner.value.revokeDelegationMessages();
      const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value, {
        gasPrice: GasPrice.fromString('0.025uphoton'),
      });

      await client.signAndBroadcastSync(sessionSigner.value.primaryAddress(), messages, 'auto');
      sessionSigner.value = undefined;
      hasGrants.value = false;
      walletState.isUsingSingleSession = false;
    } catch (err) {
      console.error(err);
    } finally {
      isUpdating.value = false;
    }
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

    isUpdating.value = true;

    const aminoTypes = new AminoTypes({ ...createAuthzAminoConverters(), ...createFeegrantAminoConverters() });
    const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value, {
      gasPrice: GasPrice.fromString('0.025uphoton'),
      aminoTypes,
    });

    let stintSigner: SessionSigner;

    try {
      stintSigner = await newSessionSigner({
        primaryClient: client as never,
        saltName: `${window.location.origin}/dither-session`,
        logger: consoleLogger,
      });
    } catch (err) {
      console.warn(`User Declined Session Key Access`);
      console.error(err);
      isUpdating.value = false;
      return;
    }

    const primaryAddress = stintSigner.primaryAddress();
    let existingAuthz = await stintSigner.hasAuthzGrant();
    let existingFeeGrant = await stintSigner.hasFeegrant();

    if (!existingAuthz || !existingFeeGrant) {
      try {
        const messages = stintSigner.generateDelegationMessages({
          sessionExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
          spendLimit: { denom: 'uphoton', amount: String(1_000_000) }, // 1 PHOTON
          gasLimit: { denom: 'uphoton', amount: String(500_000) }, // 0.5 PHOTON,
          allowedRecipients: [destinationWallet],
        });

        await client.signAndBroadcastSync(primaryAddress, messages, 'auto');
      } catch (err) {
        console.warn(`User Declined Transaction for Authz / FeeGrant`);
        console.error(err);
        isUpdating.value = false;
        return;
      }
    }

    existingAuthz = await stintSigner.hasAuthzGrant();
    existingFeeGrant = await stintSigner.hasFeegrant();

    if (existingAuthz && existingFeeGrant) {
      hasGrants.value = true;
      sessionSigner.value = stintSigner;
      walletState.isUsingSingleSession = true;
    }

    isUpdating.value = false;
  };

  return {
    clearSession,
    createSession,
    sessionSigner,
    hasGrants,
    isUpdating,
  };
}
