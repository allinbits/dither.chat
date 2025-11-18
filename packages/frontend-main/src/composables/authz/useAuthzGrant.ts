import type { EncodeObject } from '@cosmjs/proto-signing';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { MsgGrant } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { BasicAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { MsgGrantAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';

import { useConfigStore } from '@/stores/useConfigStore';

import { useWallet } from '../useWallet';
import { QUERY_KEY_AUTHZ_GRANTS } from './useAuthzGrants';

export function useAuthzGrant() {
  const wallet = useWallet();
  const configStore = useConfigStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (grantee: string) => {
      if (!wallet.address.value) {
        throw new Error('Wallet not connected');
      }

      const granter = wallet.address.value;
      const destinationWallet = configStore.envConfig.communityWallet;
      const sendAuthorization = SendAuthorization.fromPartial({
        spendLimit: [{ denom: 'uphoton', amount: String(1_000_000) }], // 1 PHOTON
        allowList: [destinationWallet],
      });

      const msgGrant = MsgGrant.fromPartial({
        granter,
        grantee,
        grant: {
          authorization: {
            typeUrl: SendAuthorization.typeUrl,
            value: SendAuthorization.encode(sendAuthorization).finish(),
          },
        },
      });

      const allowance = BasicAllowance.fromPartial({
        spendLimit: [{ denom: 'uphoton', amount: String(10_000_000) }], // 10 PHOTON for gas
        expiration: undefined,
      });

      const feeAllowance = MsgGrantAllowance.fromPartial({
        granter,
        grantee,
        allowance: {
          typeUrl: BasicAllowance.typeUrl,
          value: BasicAllowance.encode(allowance).finish(),
        },
      });

      const msgs: EncodeObject[] = [{
        typeUrl: MsgGrant.typeUrl,
        value: msgGrant,
      }, {
        typeUrl: MsgGrantAllowance.typeUrl,
        value: feeAllowance,
      }];

      return await wallet.sendTx(msgs, 'Grant authorization for dither.chat');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_AUTHZ_GRANTS] });
    },
  });

  return mutation;
}
