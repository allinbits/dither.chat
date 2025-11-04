import type { EncodeObject, OfflineSigner } from '@cosmjs/proto-signing';
import type { DeliverTxResponse, SignerData } from '@cosmjs/stargate';
import type { Ref } from 'vue';

import { AminoTypes, coins, createDefaultAminoConverters, SigningStargateClient } from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { ref } from 'vue';

import { createAuthzAminoConverters } from '@/utility/authz';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

import { useSessionWallet } from '../useSessionWallet';

const TX_BROADCAST_TIMEOUT = 30_000;
const DEFAULT_GAS_CEIL = 1.6;

export interface TransactionManager {
  sendTx: (msgs: EncodeObject[], formattedMemo?: string) => Promise<TransactionResponse>;
  sendBankTx: (formattedMemo: string, amount: string, destinationWallet: string) => Promise<TransactionResponse>;
}

export interface TransactionResponse {
  broadcast: boolean;
  tx?: DeliverTxResponse;
  msg?: string;
}

export interface TransactionManagerParams {
  signer: Ref<OfflineSigner | null>;
  address: Ref<string>;
  processState: Ref<'idle' | 'starting' | 'connecting' | 'simulating' | 'broadcasting'>;
  sequence: Ref<number>;
  accountNumber: Ref<number>;
  isUsingSingleSession: Ref<boolean>;
  onBalanceUpdate: (address: string) => void;
}

export function useTransactionManager(params: TransactionManagerParams): TransactionManager {
  const { signer, address, processState, sequence, accountNumber, isUsingSingleSession, onBalanceUpdate } = params;

  const txProcessingCount = ref(0);
  const cachedGasLimit = ref('');
  const chainInfo = getChainConfigLazy();

  const sendTx = async (msgs: EncodeObject[], formattedMemo?: string): Promise<TransactionResponse> => {
    const response: TransactionResponse = { broadcast: false };
    processState.value = 'starting';

    if (!signer.value) {
      processState.value = 'idle';
      throw new Error('Could not sign messages');
    }

    let isPreIncremented = false;

    try {
      txProcessingCount.value++;
      processState.value = 'connecting';

      const aminoTypes = new AminoTypes({
        ...createAuthzAminoConverters(),
        ...createDefaultAminoConverters(),
      });
      const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value, {
        aminoTypes,
      });
      processState.value = 'simulating';

      let gasLimit = '';

      if (txProcessingCount.value > 1) {
        gasLimit = cachedGasLimit.value;
      } else {
        const simulate = await client.simulate(address.value, msgs, formattedMemo);
        gasLimit = simulate && simulate > 0 ? `${Math.ceil(simulate * DEFAULT_GAS_CEIL)}` : '500000';
        cachedGasLimit.value = gasLimit;
      }

      processState.value = 'broadcasting';

      const explicitSignerData: SignerData = {
        accountNumber: accountNumber.value,
        sequence: sequence.value,
        chainId: chainInfo.value.chainId,
      };

      // NOTE: to allow multi actions at a time, we support that the tx would be done successfully
      // and the sequence would be incremented by 1 then decremented by 1 later if failed
      sequence.value++;
      isPreIncremented = true;

      const signedTx = await client.sign(
        address.value,
        msgs,
        {
          amount: [
            {
              amount: Math.ceil(Number(gasLimit) * 0.225).toString(),
              denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom,
            },
          ],
          gas: gasLimit,
        },
        formattedMemo ?? '',
        explicitSignerData,
      );

      const txBytes = TxRaw.encode(signedTx).finish();
      const result = await client.broadcastTx(txBytes, TX_BROADCAST_TIMEOUT);

      response.msg = result.code === 0 ? 'successfully broadcast' : 'failed to broadcast transaction';
      response.broadcast = result.code === 0;
      response.tx = result;

      // Update balance if tx was successful
      if (response.broadcast) {
        onBalanceUpdate(address.value);
      }

      return response;
    } catch (err) {
      console.error(err);
      if (isPreIncremented) {
        sequence.value--;
      }
      throw new Error('Could not sign messages');
    } finally {
      isPreIncremented = false;
      processState.value = 'idle';
      txProcessingCount.value--;
    }
  };

  const sendBankTx = async (
    formattedMemo: string,
    amount: string,
    destinationWallet: string,
  ): Promise<TransactionResponse> => {
    const response: TransactionResponse = { broadcast: false };
    processState.value = 'starting';

    if (!signer.value) {
      processState.value = 'idle';
      response.msg = 'No valid signer available.';
      return response;
    }

    let isPreIncremented = false;
    const currentLocalSequence = sequence.value;

    try {
      txProcessingCount.value++;
      processState.value = 'connecting';

      const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value);
      processState.value = 'simulating';

      let gasLimit = '';

      // NOTE: when executing multiple txs, when then first tx is not done, the 2nd tx should have
      // sequence = 1st tx sequence + 1, but there is no way to send custom sequence with simulate function
      // which will throw error. So we use the cached gas limit to avoid simulating again
      if (txProcessingCount.value > 1) {
        gasLimit = cachedGasLimit.value;
      } else {
        const simulate = await client.simulate(
          address.value,
          [
            {
              typeUrl: '/cosmos.bank.v1beta1.MsgSend',
              value: {
                fromAddress: address.value,
                toAddress: destinationWallet,
                amount: coins(1, chainInfo.value.feeCurrencies[0].coinMinimalDenom),
              },
            },
          ],
          formattedMemo,
        );

        gasLimit = simulate && simulate > 0 ? `${Math.ceil(simulate * DEFAULT_GAS_CEIL)}` : '500000';
        cachedGasLimit.value = gasLimit;
      }

      processState.value = 'broadcasting';

      const sessionWallet = useSessionWallet();
      let result: DeliverTxResponse;

      if (isUsingSingleSession.value && sessionWallet.sessionSigner.value) {
        result = await sessionWallet.sessionSigner.value.execute.send({
          toAddress: destinationWallet,
          amount: [{ denom: 'uphoton', amount: String(100_000) }], // 0.1 PHOTON
          memo: formattedMemo,
        });

        // NOTE: to allow multi actions at a time, we support that the tx would be done successfully
        // and the sequence would be incremented by 1 then decremented by 1 later if failed
        sequence.value++;
        isPreIncremented = true;
      } else {
        const explicitSignerData: SignerData = {
          accountNumber: accountNumber.value,
          sequence: currentLocalSequence,
          chainId: chainInfo.value.chainId,
        };

        // NOTE: to allow multi actions at a time, we support that the tx would be done successfully
        // and the sequence would be incremented by 1 then decremented by 1 later if failed
        sequence.value++;
        isPreIncremented = true;

        const signedTx = await client.sign(
          address.value,
          [
            {
              typeUrl: '/cosmos.bank.v1beta1.MsgSend',
              value: {
                fromAddress: address.value,
                toAddress: destinationWallet,
                amount: [{ amount, denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom }],
              },
            },
          ],
          {
            amount: [
              {
                amount: Math.ceil(Number(gasLimit) * 0.225).toString(),
                denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom,
              },
            ],
            gas: gasLimit,
          },
          formattedMemo,
          explicitSignerData,
        );

        const txBytes = TxRaw.encode(signedTx).finish();
        result = await client.broadcastTx(txBytes, TX_BROADCAST_TIMEOUT);
      }

      response.msg = result.code === 0 ? 'successfully broadcast' : 'failed to broadcast transaction';
      response.broadcast = result.code === 0;
      response.tx = result;

      // Update balance if tx was successful
      if (response.broadcast) {
        onBalanceUpdate(address.value);
      }

      return response;
    } catch (err) {
      if (isPreIncremented) {
        sequence.value--;
      }

      response.msg = String(err);
      return response;
    } finally {
      isPreIncremented = false;
      processState.value = 'idle';
      txProcessingCount.value--;
    }
  };

  return {
    sendTx,
    sendBankTx,
  };
}
