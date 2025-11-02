import type { SessionTypes } from '@walletconnect/types';
import type { ConnectParams } from '@walletconnect/universal-provider';

import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';
import { onMounted, ref } from 'vue';

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!PROJECT_ID) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

const RECOMMENDED_WALLET_IDS: string[] = (import.meta.env.VITE_WALLETCONNECT_WALLET_IDS?.split(',') ?? []).filter(Boolean);

// AtomOne chain configurations
const ATOMONE_CHAINS = {
  mainnet: 'cosmos:atomone-1',
  testnet: 'cosmos:atomone-testnet-1',
  devnet: 'cosmos:atomone-devnet-1',
};

const CONNECTION_PARAMS: ConnectParams = {
  optionalNamespaces: {
    cosmos: {
      chains: [
        ATOMONE_CHAINS.mainnet,
        ATOMONE_CHAINS.testnet,
        ATOMONE_CHAINS.devnet,
      ],
      methods: [
        'cosmos_getAccounts',
        'cosmos_signDirect',
        'cosmos_signAmino',
      ],
      events: [],
    },
  },
  // Additional options to help with verification issues
  pairingTopic: undefined,
  skipPairing: false,
};

export function useWalletConnect() {
  const provider = ref<UniversalProvider | null>(null);
  const session = ref<SessionTypes.Struct | null>(null);

  const modal = new WalletConnectModal({
    projectId: PROJECT_ID,
    // Configure modal to only show Keplr
    enableExplorer: true,
    explorerRecommendedWalletIds: RECOMMENDED_WALLET_IDS,
    explorerExcludedWalletIds: 'ALL',
  });

  onMounted(async () => {
    provider.value = await UniversalProvider.init({
      projectId: PROJECT_ID,
      // Disable verification to avoid untrusted origin warnings
      disableProviderPing: true,
    });
  });

  const connect = async (): Promise<SessionTypes.Struct | null> => {
    if (!provider.value) {
      throw new Error('Provider not initialized');
    }

    try {
      const { uri, approval } = await provider.value?.client.connect(CONNECTION_PARAMS);

      if (uri) {
        modal.openModal({ uri });
      }

      session.value = await approval();

      // Close modal after successful connection
      modal.closeModal();

      return session.value;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      modal.closeModal();
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (!provider.value) {
      throw new Error('Provider not initialized');
    }

    if (!session.value) {
      throw new Error('Session not initialized');
    }

    await provider.value?.client.disconnect({
      topic: session.value.topic,
      reason: {
        code: 1000,
        message: 'User disconnected',
      },
    });
  };

  return {
    provider,
    connect,
    disconnect,
  };
}
