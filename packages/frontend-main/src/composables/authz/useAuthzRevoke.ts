import type { EncodeObject } from '@cosmjs/proto-signing';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import { useWallet } from '../useWallet';
import { QUERY_KEY_AUTHZ_GRANTS } from './useAuthzGrants';

export function useAuthzRevoke() {
  const wallet = useWallet();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (grantee: string) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_AUTHZ_GRANTS] });
    },
  });

  return mutation;
}
