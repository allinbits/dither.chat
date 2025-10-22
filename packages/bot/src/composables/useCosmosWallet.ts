import { ref, computed } from "vue";

// Cosmos wallet types
export interface CosmosWallet {
  address: string;
  name: string;
  logo: string;
  isInstalled: boolean;
}

export interface CosmosAccount {
  address: string;
  pubKey: Uint8Array;
  isNanoLedger: boolean;
}

export interface CosmosSignOptions {
  chainId: string;
  fee: {
    amount: string;
    gas: string;
  };
  memo: string;
}

// Supported Cosmos wallets
const SUPPORTED_WALLETS: CosmosWallet[] = [
  {
    name: "Keplr",
    logo: "https://raw.githubusercontent.com/chainapsis/keplr-wallet/master/packages/extension/src/public/assets/logo-256.png",
    address: "keplr",
    isInstalled: false,
  },
  {
    name: "Leap",
    logo: "https://leapwallet.io/logo.png",
    address: "leap",
    isInstalled: false,
  },
  {
    name: "Cosmostation",
    logo: "https://cosmostation.io/img/logo.png",
    address: "cosmostation",
    isInstalled: false,
  },
];

// AtomOne network configuration
const ATOMONE_CONFIG = {
  chainId: "atomone_1",
  chainName: "AtomOne",
  rpc: "https://rpc.atomone.xyz",
  rest: "https://lcd.atomone.xyz",
  bech32Config: {
    bech32PrefixAccAddr: "atone",
    bech32PrefixAccPub: "atonepub",
    bech32PrefixValAddr: "atonevaloper",
    bech32PrefixValPub: "atonevaloperpub",
    bech32PrefixConsAddr: "atonevalcons",
    bech32PrefixConsPub: "atonevalconspub",
  },
  currencies: [
    {
      coinDenom: "ATONE",
      coinMinimalDenom: "uatone",
      coinDecimals: 6,
    },
    {
      coinDenom: "PHOTON",
      coinMinimalDenom: "uphoton",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "ATONE",
      coinMinimalDenom: "uatone",
      coinDecimals: 6,
    },
  ],
  stakeCurrency: {
    coinDenom: "ATONE",
    coinMinimalDenom: "uatone",
    coinDecimals: 6,
  },
  features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
};

class CosmosWalletError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "CosmosWalletError";
  }
}

// Cosmos wallet integration composable
export function useCosmosWallet() {
  const isConnected = ref(false);
  const account = ref<CosmosAccount | null>(null);
  const selectedWallet = ref<CosmosWallet | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Check if wallets are installed
  const checkWalletAvailability = () => {
    if (typeof window === "undefined") return;

    // Check Keplr
    if (window.keplr) {
      const keplrWallet = SUPPORTED_WALLETS.find((w) => w.name === "Keplr");
      if (keplrWallet) keplrWallet.isInstalled = true;
    }

    // Check Leap
    if (window.leap) {
      const leapWallet = SUPPORTED_WALLETS.find((w) => w.name === "Leap");
      if (leapWallet) leapWallet.isInstalled = true;
    }

    // Check Cosmostation
    if (window.cosmostation) {
      const cosmostationWallet = SUPPORTED_WALLETS.find(
        (w) => w.name === "Cosmostation",
      );
      if (cosmostationWallet) cosmostationWallet.isInstalled = true;
    }
  };

  // Connect to a specific wallet
  const connectWallet = async (walletName: string) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      const wallet = SUPPORTED_WALLETS.find((w) => w.name === walletName);
      if (!wallet) {
        throw new CosmosWalletError(`Wallet ${walletName} not supported`);
      }

      if (!wallet.isInstalled) {
        throw new CosmosWalletError(`${walletName} wallet not installed`);
      }

      let client: any;

      switch (walletName) {
        case "Keplr":
          if (!window.keplr) throw new CosmosWalletError("Keplr not available");
          client = window.keplr;
          break;
        case "Leap":
          if (!window.leap) throw new CosmosWalletError("Leap not available");
          client = window.leap;
          break;
        case "Cosmostation":
          if (!window.cosmostation)
            throw new CosmosWalletError("Cosmostation not available");
          client = window.cosmostation;
          break;
        default:
          throw new CosmosWalletError(`Unsupported wallet: ${walletName}`);
      }

      // Request connection
      await client.enable(ATOMONE_CONFIG.chainId);

      // Get account info
      const key = await client.getKey(ATOMONE_CONFIG.chainId);

      account.value = {
        address: key.bech32Address,
        pubKey: key.pubKey,
        isNanoLedger: key.isNanoLedger,
      };

      selectedWallet.value = wallet;
      isConnected.value = true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to connect wallet";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    isConnected.value = false;
    account.value = null;
    selectedWallet.value = null;
    error.value = null;
  };

  // Sign a transaction
  const signTransaction = async (tx: any, options: CosmosSignOptions) => {
    if (!isConnected.value || !selectedWallet.value) {
      throw new CosmosWalletError("Wallet not connected");
    }

    try {
      let client: any;

      switch (selectedWallet.value.name) {
        case "Keplr":
          client = window.keplr;
          break;
        case "Leap":
          client = window.leap;
          break;
        case "Cosmostation":
          client = window.cosmostation;
          break;
        default:
          throw new CosmosWalletError("Unsupported wallet");
      }

      const result = await client.signAmino(
        ATOMONE_CONFIG.chainId,
        account.value!.address,
        tx,
        options,
      );

      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to sign transaction";
      throw err;
    }
  };

  // Get account balance
  const getBalance = async (denom: string = "uphoton") => {
    if (!isConnected.value) {
      throw new CosmosWalletError("Wallet not connected");
    }

    try {
      // This would typically make an RPC call to get balance
      // For now, return a mock balance
      return {
        denom,
        amount: "1000000", // 1 PHOTON in micro units
      };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get balance";
      throw err;
    }
  };

  // Initialize wallet detection
  const initialize = () => {
    checkWalletAvailability();
  };

  return {
    // State
    isConnected: computed(() => isConnected.value),
    account: computed(() => account.value),
    selectedWallet: computed(() => selectedWallet.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    availableWallets: computed(() =>
      SUPPORTED_WALLETS.filter((w) => w.isInstalled),
    ),

    // Methods
    connectWallet,
    disconnectWallet,
    signTransaction,
    getBalance,
    initialize,
  };
}

// Global window type extensions
declare global {
  interface Window {
    keplr?: any;
    leap?: any;
    cosmostation?: any;
  }
}
