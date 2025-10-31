import type { WalletType } from '../../useWallet';
import type { WalletAdapter } from './types';

import { cosmostationAdapter } from './cosmostation';
import { keplrAdapter } from './keplr';
import { leapAdapter } from './leap';

export const walletAdapters: Record<WalletType, WalletAdapter | null> = {
  Keplr: keplrAdapter,
  Leap: leapAdapter,
  Cosmostation: cosmostationAdapter,
  AddressOnly: null,
};

export { cosmostationAdapter } from './cosmostation';
export { keplrAdapter } from './keplr';
export { leapAdapter } from './leap';

export type { ChainInfo, WalletAdapter, WalletConnectionResult } from './types';
