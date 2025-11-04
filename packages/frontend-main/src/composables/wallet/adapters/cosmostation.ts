import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { OfflineAminoSigner } from '@keplr-wallet/types';

import type { ChainInfo, WalletAdapter, WalletConnectionResult } from './types';

import { getOfflineSigner } from '@cosmostation/cosmos-client';

export const cosmostationAdapter: WalletAdapter = {
  async signMessage(chainId: string, address: string, text: string) {
    return window.cosmostation.providers.keplr.signArbitrary(chainId, address, text);
  },

  async connect(chainInfo: ChainInfo): Promise<WalletConnectionResult> {
    // Try to add chain, ignore if already added
    try {
      await (window.cosmostation as any).cosmos.request({
        method: 'cos_addChain',
        params: {
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainName,
          addressPrefix: chainInfo.bech32Config?.bech32PrefixAccAddr ?? '',
          baseDenom: chainInfo.stakeCurrency?.coinMinimalDenom ?? '',
          displayDenom: chainInfo.stakeCurrency?.coinDenom ?? '',
          restURL: chainInfo.rest,
          decimals: chainInfo.stakeCurrency?.coinDecimals ?? 0,
          coinType: `${chainInfo.bip44?.coinType ?? 118}`,
        },
      });
    } catch (e: unknown) {
      if ((e as { code: number }).code !== -32602) {
        throw e;
      }
    }

    // Request account access
    const account = await (window.cosmostation as any).cosmos.request({
      method: 'cos_requestAccount',
      params: { chainName: chainInfo.chainId },
    });

    // Get and configure signer
    const cosmostationSigner = (await getOfflineSigner(chainInfo.chainId)) as OfflineSigner;
    let signer: OfflineSigner;

    if ((cosmostationSigner as any).signDirect) {
      const { signDirect: _signDirect, ...aminoSigner } = cosmostationSigner as any;
      signer = aminoSigner as OfflineAminoSigner;
    } else {
      signer = cosmostationSigner;
    }

    return {
      address: account.address,
      signer,
    };
  },
};
