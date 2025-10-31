import type { Ref } from 'vue';

import type { TransactionResponse } from './transactions';
import type { DitherTypes } from '@/types';

import { coins } from '@cosmjs/stargate';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export interface DitherUtilities {
  tipUser: (address: string, amount?: string) => Promise<TransactionResponse>;
  send: <K extends keyof DitherTypes>(
    type: K,
    data: { args: DitherTypes[K]; amount?: string },
  ) => Promise<TransactionResponse>;
}

export interface DitherUtilitiesParams {
  address: Ref<string>;
  sendTx: (msgs: any[], formattedMemo?: string) => Promise<TransactionResponse>;
  sendBankTx: (formattedMemo: string, amount: string, destinationWallet: string) => Promise<TransactionResponse>;
  destinationWallet: string;
}

export function useDitherUtilities(params: DitherUtilitiesParams): DitherUtilities {
  const { address, sendTx, sendBankTx, destinationWallet } = params;
  const chainInfo = getChainConfigLazy();

  const tipUser = async (targetAddress: string, amount = '1'): Promise<TransactionResponse> => {
    return sendTx(
      [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: address.value,
            toAddress: targetAddress,
            amount: coins(amount, chainInfo.value.feeCurrencies[0].coinMinimalDenom),
          },
        },
      ],
      `dither.TipUser("${targetAddress}")`,
    );
  };

  const send = async <K extends keyof DitherTypes>(
    type: K,
    data: { args: DitherTypes[K]; amount?: string },
  ): Promise<TransactionResponse> => {
    data.amount ??= '1';
    const memo = `dither.${type}("${data.args.join('","')}")`;
    return await sendBankTx(memo, data.amount, destinationWallet);
  };

  return {
    tipUser,
    send,
  };
}
