import type { StdSignature } from '@keplr-wallet/types';

import type { WalletType } from '../useWallet';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

import { Wallets } from '../useWallet';
import { walletAdapters } from './adapters';

export interface SignMessageParams {
  walletType: WalletType | null;
  address: string;
  text: string;
}

export async function signMessage(params: SignMessageParams): Promise<StdSignature | undefined> {
  const { walletType, address, text } = params;

  if (!walletType || walletType === Wallets.addressOnly) {
    throw new Error(`No valid wallet connected to sign messages.`);
  }
  const adapter = walletAdapters[walletType];
  if (!adapter) {
    throw new Error(`Wallet adapter not found for ${walletType}.`);
  }
  const chainInfo = getChainConfigLazy();
  return adapter.signMessage(chainInfo.value.chainId, address, text);
}
