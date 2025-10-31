import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { OfflineAminoSigner } from '@keplr-wallet/types';

import { getOfflineSigner } from '@cosmostation/cosmos-client';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

import { Wallets } from '../useWallet';

export interface WalletConnectionParams {
  walletType: Wallets;
  address?: string;
  signal?: AbortSignal;
  onAbort: () => void;
  setAddress: (address: string) => void;
  setUsed: (wallet: Wallets | null) => void;
  setSigner: (signer: OfflineSigner | null) => void;
}

export async function connectWallet(params: WalletConnectionParams): Promise<void> {
  const { walletType, address, signal, onAbort, setAddress, setUsed, setSigner } = params;

  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  signal?.addEventListener('abort', onAbort);

  const chainInfo = getChainConfigLazy();

  try {
    switch (walletType) {
      case Wallets.keplr:
        await connectKeplr(chainInfo.value, setAddress, setUsed, setSigner);
        break;
      case Wallets.leap:
        await connectLeap(chainInfo.value, setAddress, setUsed, setSigner);
        break;
      case Wallets.cosmostation:
        await connectCosmostation(chainInfo.value, setAddress, setUsed, setSigner);
        break;
      case Wallets.addressOnly:
        if (address) {
          setAddress(address);
          setUsed(Wallets.addressOnly);
        }
        break;
    }

    if (signal?.aborted) {
      onAbort();
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

async function connectKeplr(
  chainInfo: Awaited<ReturnType<typeof getChainConfigLazy>>['value'],
  setAddress: (address: string) => void,
  setUsed: (wallet: Wallets | null) => void,
  setSigner: (signer: OfflineSigner | null) => void,
) {
  await window.keplr?.experimentalSuggestChain(chainInfo);
  await window.keplr?.enable(chainInfo.chainId);

  if (!window.getOfflineSignerOnlyAmino) {
    throw new Error('Could not connect to Keplr: getOfflineSigner method does not exist');
  }

  const signer = window.getOfflineSignerOnlyAmino(chainInfo.chainId);
  const accounts = await signer.getAccounts();
  setAddress(accounts[0].address);
  setUsed(Wallets.keplr);
  setSigner(signer);
}

async function connectLeap(
  chainInfo: Awaited<ReturnType<typeof getChainConfigLazy>>['value'],
  setAddress: (address: string) => void,
  setUsed: (wallet: Wallets | null) => void,
  setSigner: (signer: OfflineSigner | null) => void,
) {
  await window.leap?.experimentalSuggestChain(chainInfo);
  await window.leap?.enable(chainInfo.chainId);

  const signer = window.leap.getOfflineSignerOnlyAmino(chainInfo.chainId);
  const accounts = await signer.getAccounts();
  setAddress(accounts[0].address);
  setUsed(Wallets.leap);
  setSigner(signer);
}

async function connectCosmostation(
  chainInfo: Awaited<ReturnType<typeof getChainConfigLazy>>['value'],
  setAddress: (address: string) => void,
  setUsed: (wallet: Wallets | null) => void,
  setSigner: (signer: OfflineSigner | null) => void,
) {
  // Try to add chain, ignore if already added
  try {
    await (window.cosmostation as any).cosmos.request({
      method: 'cos_addChain',
      params: {
        chainId: chainInfo.chainId,
        chainName: chainInfo.chainName,
        addressPrefix: chainInfo.bech32Config.bech32PrefixAccAddr,
        baseDenom: chainInfo.stakeCurrency.coinMinimalDenom,
        displayDenom: chainInfo.stakeCurrency.coinDenom,
        restURL: chainInfo.rest,
        decimals: chainInfo.stakeCurrency.coinDecimals,
        coinType: `${chainInfo.bip44.coinType}`,
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

  setAddress(account.address);
  setUsed(Wallets.cosmostation);

  // Get and configure signer
  const cosmostationSigner = (await getOfflineSigner(chainInfo.chainId)) as OfflineSigner;
  if ((cosmostationSigner as any).signDirect) {
    const { signDirect: _signDirect, ...aminoSigner } = cosmostationSigner as any;
    setSigner(aminoSigner as OfflineAminoSigner);
  } else {
    setSigner(cosmostationSigner);
  }
}
