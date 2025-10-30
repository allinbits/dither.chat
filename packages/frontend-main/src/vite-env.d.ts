/// <reference types="vite/client" />
import type { Keplr, Window as KeplrWindow } from '@keplr-wallet/types';

declare global {
  interface Window extends KeplrWindow {
    leap: Keplr;
    cosmostation: {
      providers: {
        keplr: Keplr;
      };
    };
  }
}
