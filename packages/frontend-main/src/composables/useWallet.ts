import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { Ref } from 'vue';

import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { useWalletStateStore } from '@/stores/useWalletStateStore';

import { useBalanceFetcher } from './useBalanceFetcher';
import { useSessionWallet } from './useSessionWallet';
import { authenticate, signOut as signOutAuth } from './wallet/auth';
import { connectWallet } from './wallet/connection';
import { useDitherUtilities } from './wallet/dither';
import { useSequenceManager } from './wallet/sequence';
import { signMessage as signMessageUtil } from './wallet/signing';
import { useTransactionManager } from './wallet/transactions';

export enum Wallets {
  keplr = 'Keplr',
  leap = 'Leap',
  cosmostation = 'Cosmostation',
  addressOnly = 'AddressOnly',
}

export function getWalletHelp(wallet: Wallets) {
  switch (wallet) {
    case Wallets.keplr:
      return 'https://help.keplr.app/articles/advanced-troubleshooting-guidelines';
    case Wallets.leap:
      return 'https://leapwallet.notion.site/Leap-Cosmos-Wallet-Support-ba1da3c05d3341eaa44a1850ed3260ee';
    case Wallets.cosmostation:
      return 'https://guide.cosmostation.io/web_wallet_en.html';
  }
}

function useWalletInstance() {
  const signer: Ref<OfflineSigner | null> = ref(null);
  const configStore = useConfigStore();
  const balanceFetcher = useBalanceFetcher();
  const walletDialogStore = useWalletDialogStore();
  const walletState = storeToRefs(useWalletStateStore());

  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';
  const destinationWallet = configStore.envConfig.communityWallet ?? 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep';

  // Sequence management
  const sequenceManager = useSequenceManager();

  // Transaction manager
  const transactionManager = useTransactionManager({
    signer,
    address: walletState.address,
    processState: walletState.processState,
    sequence: sequenceManager.sequence,
    accountNumber: sequenceManager.accountNumber,
    isUsingSingleSession: walletState.isUsingSingleSession,
    onBalanceUpdate: (address: string) => balanceFetcher.updateAddress(address),
  });

  // Dither utilities
  const ditherUtilities = useDitherUtilities({
    address: walletState.address,
    sendTx: transactionManager.sendTx,
    sendBankTx: (memo: string, amount: string) =>
      transactionManager.sendBankTx(memo, amount, destinationWallet),
    destinationWallet,
  });

  // Message signing wrapper
  const signMessage = async (text: string) => {
    if (!signer.value) {
      throw new Error('Could not sign messages');
    }
    return signMessageUtil({
      walletType: walletState.used.value,
      address: walletState.address.value,
      text,
    });
  };

  // Sign out handler
  const signOut = async () => {
    walletState.address.value = '';
    walletState.used.value = null;
    walletState.loggedIn.value = false;
    walletState.processState.value = 'idle';
    await signOutAuth(apiRoot);
  };

  // Watch for address/signer changes to update sequence
  watch([walletState.address, signer], async ([addressValue, signerValue]) => {
    if (addressValue && signerValue) {
      await sequenceManager.updateSequence(addressValue, signerValue);
    }
  });

  // Connect wallet
  const connect = async (walletType: Wallets, address?: string, signal?: AbortSignal) => {
    await connectWallet({
      walletType,
      address,
      signal,
      onAbort: signOut,
      setAddress: (addr: string) => {
        walletState.address.value = addr;
      },
      setUsed: (wallet: Wallets | null) => {
        walletState.used.value = wallet;
      },
      setSigner: (s: OfflineSigner | null) => {
        signer.value = s;
      },
    });

    // Authenticate if address is set
    if (walletState.address.value) {
      await authenticate({
        apiRoot,
        address: walletState.address.value,
        signMessage,
        setLoggedIn: (loggedIn: boolean) => {
          walletState.loggedIn.value = loggedIn;
        },
        signOut,
      });
    }

    // Create session if needed
    if (walletState.isUsingSingleSession.value) {
      await useSessionWallet().createSession();
    }

    walletDialogStore.hideDialog();
  };

  // Refresh address
  const refreshAddress = () => {
    switch (walletState.used.value) {
      case Wallets.addressOnly:
        connect(walletState.used.value, walletState.address.value);
        break;
      case Wallets.keplr:
      case Wallets.leap:
      case Wallets.cosmostation:
        connect(walletState.used.value);
        break;
    }
  };

  // Set up wallet change listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('cosmostation_keystorechange', refreshAddress);
    window.addEventListener('keplr_keystorechange', refreshAddress);
    window.addEventListener('leap_keystorechange', refreshAddress);
  }

  return {
    ...walletState,
    signer,
    signOut,
    connect,
    sendTx: transactionManager.sendTx,
    refreshAddress,
    signMessage,
    dither: {
      send: ditherUtilities.send,
      tipUser: ditherUtilities.tipUser,
    },
  };
}

let walletInstance: ReturnType<typeof useWalletInstance>;

export function useWallet() {
  if (!walletInstance) {
    walletInstance = useWalletInstance();
  }
  return walletInstance;
}
