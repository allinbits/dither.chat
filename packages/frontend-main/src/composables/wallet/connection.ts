import type { OfflineSigner } from '@cosmjs/proto-signing';

import type { WalletType } from '../useWallet';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

import { Wallets } from '../useWallet';
import { walletAdapters } from './adapters';

export interface WalletConnectionParams {
  walletType: WalletType;
  address?: string;
  signal?: AbortSignal;
  onAbort: () => void;
  setAddress: (address: string) => void;
  setUsed: (wallet: WalletType | null) => void;
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
    if (walletType === Wallets.addressOnly) {
      // address only wallet does not need to be connected
      if (address) {
        setAddress(address);
        setUsed(Wallets.addressOnly);
      }
    } else {
      const adapter = walletAdapters[walletType];
      if (!adapter) {
        throw new Error(`Wallet adapter not found for ${walletType}`);
      }

      const result = await adapter.connect(chainInfo.value);
      setAddress(result.address);
      setUsed(walletType);
      setSigner(result.signer);
    }

    if (signal?.aborted) {
      onAbort();
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}
