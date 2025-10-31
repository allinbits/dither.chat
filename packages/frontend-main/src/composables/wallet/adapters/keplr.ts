import type { ChainInfo, WalletAdapter, WalletConnectionResult } from './types';

export const keplrAdapter: WalletAdapter = {
  async signMessage(chainId: string, address: string, text: string) {
    return window.keplr?.signArbitrary(chainId, address, text);
  },

  async connect(chainInfo: ChainInfo): Promise<WalletConnectionResult> {
    await window.keplr?.experimentalSuggestChain(chainInfo);
    await window.keplr?.enable(chainInfo.chainId);

    if (!window.getOfflineSignerOnlyAmino) {
      throw new Error('Could not connect to Keplr: getOfflineSigner method does not exist');
    }

    const signer = window.getOfflineSignerOnlyAmino(chainInfo.chainId);
    const accounts = await signer.getAccounts();

    return {
      address: accounts[0].address,
      signer,
    };
  },
};
