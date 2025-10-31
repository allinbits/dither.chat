import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { Ref } from 'vue';

import { SigningStargateClient } from '@cosmjs/stargate';
import { ref } from 'vue';

import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export interface SequenceManager {
  sequence: Ref<number>;
  accountNumber: Ref<number>;
  updateSequence: (address: string, signer: OfflineSigner) => Promise<void>;
  incrementSequence: () => void;
  decrementSequence: () => void;
}

export function useSequenceManager(): SequenceManager {
  const sequence = ref(0);
  const accountNumber = ref(0);
  const chainInfo = getChainConfigLazy();

  const updateSequence = async (address: string, signer: OfflineSigner) => {
    const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer);
    const { sequence: seq, accountNumber: accNum } = await client.getSequence(address);
    sequence.value = seq;
    accountNumber.value = accNum;
  };

  const incrementSequence = () => {
    sequence.value++;
  };

  const decrementSequence = () => {
    sequence.value--;
  };

  return {
    sequence,
    accountNumber,
    updateSequence,
    incrementSequence,
    decrementSequence,
  };
}
