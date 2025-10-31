import type { ChainInfo, WalletAdapter, WalletConnectionResult } from './types';

export const leapAdapter: WalletAdapter = {
  async signMessage(chainId: string, address: string, text: string) {
    return window.leap?.signArbitrary(chainId, address, text);
  },

  async connect(chainInfo: ChainInfo): Promise<WalletConnectionResult> {
    await window.leap?.experimentalSuggestChain(chainInfo);
    await window.leap?.enable(chainInfo.chainId);

    const signer = window.leap.getOfflineSignerOnlyAmino(chainInfo.chainId);
    const accounts = await signer.getAccounts();

    return {
      address: accounts[0].address,
      signer,
    };
  },
};
