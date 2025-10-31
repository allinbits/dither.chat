import type { StdSignature } from '@keplr-wallet/types';

import type { Wallets } from '../useWallet';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export interface SignMessageParams {
  walletType: Wallets | null;
  address: string;
  text: string;
}

export async function signMessage(params: SignMessageParams): Promise<StdSignature | undefined> {
  const { walletType, address, text } = params;
  const chainInfo = getChainConfigLazy();

  switch (walletType) {
    case 'Keplr':
      return window.keplr?.signArbitrary(chainInfo.value.chainId, address, text);
    case 'Cosmostation':
      return window.cosmostation.providers.keplr.signArbitrary(chainInfo.value.chainId, address, text);
    case 'Leap':
      return window.leap?.signArbitrary(chainInfo.value.chainId, address, text);
    default:
      throw new Error(`No valid wallet connected to sign messages.`);
  }
}
