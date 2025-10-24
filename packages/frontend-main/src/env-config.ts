import chainConfigDevnet from '@/chain-config.devnet.json';
import chainConfigMainnet from '@/chain-config.mainnet.json';
import chainConfigTestnet from '@/chain-config.testnet.json';

export const envConfigs = {
  testnet: {
    chainConfig: chainConfigTestnet,
    apiRoot: import.meta.env.VITE_API_ROOT_TESTNET,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL_TESTNET,
    communityWallet: import.meta.env.VITE_COMMUNITY_WALLET_TESTNET,
  },
  devnet: {
    chainConfig: chainConfigDevnet,
    apiRoot: import.meta.env.VITE_API_ROOT_DEVNET,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL_DEVNET,
    communityWallet: import.meta.env.VITE_COMMUNITY_WALLET_DEVNET,
  },
  mainnet: {
    chainConfig: chainConfigMainnet,
    apiRoot: import.meta.env.VITE_API_ROOT_MAINNET,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL_MAINNET,
    communityWallet: import.meta.env.VITE_COMMUNITY_WALLET_MAINNET,
  },
};
