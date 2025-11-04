import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { ChainInfo as KeplrChainInfo, StdSignature } from '@keplr-wallet/types';

// Use Keplr's ChainInfo type for compatibility
export type ChainInfo = KeplrChainInfo;

export interface WalletConnectionResult {
  address: string;
  signer: OfflineSigner;
}

export interface WalletAdapter {
  signMessage: (chainId: string, address: string, text: string) => Promise<StdSignature | undefined>;
  connect: (chainInfo: ChainInfo) => Promise<WalletConnectionResult>;
}
