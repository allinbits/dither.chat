import type { EncodeObject } from '@cosmjs/proto-signing';
import type { DeliverTxResponse } from '@cosmjs/stargate';

import { MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import { useWallet } from '../useWallet';

export function useAuthzRevoke() {
  const wallet = useWallet();

  const revokeSendGrant = async (
    grantee: string,
  ): Promise<{ broadcast: boolean; tx?: DeliverTxResponse; msg?: string }> => {
    if (!wallet.address.value) {
      throw new Error('Wallet not connected');
    }

    const msgRevoke = MsgRevoke.fromPartial({
      granter: wallet.address.value,
      grantee,
      msgTypeUrl: MsgSend.typeUrl,
    });

    const msg: EncodeObject = {
      typeUrl: MsgRevoke.typeUrl,
      value: msgRevoke,
    };

    return await wallet.sendTx([msg], 'Revoke authorization for Dither.chat');
  };

  return {
    revokeSendGrant,
  };
}
