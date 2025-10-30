import type { EncodeObject } from '@cosmjs/proto-signing';
import type { DeliverTxResponse } from '@cosmjs/stargate';

import { MsgGrant } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';

import { useConfigStore } from '@/stores/useConfigStore';

import { useWallet } from '../useWallet';

export function useAuthzGrant() {
  const wallet = useWallet();
  const configStore = useConfigStore();

  const createSendGrant = async (
    grantee: string,
  ): Promise<{ broadcast: boolean; tx?: DeliverTxResponse; msg?: string }> => {
    if (!wallet.address.value) {
      throw new Error('Wallet not connected');
    }

    const destinationWallet = configStore.envConfig.communityWallet;
    const sendAuthorization = SendAuthorization.fromPartial({
      spendLimit: [{ denom: 'uphoton', amount: String(1_000_000) }], // 1 PHOTON
      allowList: [destinationWallet],
    });

    const msgGrant = MsgGrant.fromPartial({
      granter: wallet.address.value,
      grantee,
      grant: {
        authorization: {
          typeUrl: SendAuthorization.typeUrl,
          value: SendAuthorization.encode(sendAuthorization).finish(),
        },
      },
    });

    const msg: EncodeObject = {
      typeUrl: MsgGrant.typeUrl,
      value: msgGrant,
    };

    return await wallet.sendTx([msg], 'Grant authorization for Dither.chat');
  };

  return {
    createSendGrant,
  };
}
