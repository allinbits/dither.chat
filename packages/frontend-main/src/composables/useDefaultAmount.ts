import { Decimal } from '@cosmjs/math';
import { computed } from 'vue';

import { useConfigStore } from '@/stores/useConfigStore';

import { useBalanceFetcher } from './useBalanceFetcher';
import { useFractionalDigits } from './useFractionalDigits';
import { useWallet } from './useWallet';

export function useDefaultAmount() {
  const wallet = useWallet();
  const balanceFetcher = useBalanceFetcher();
  const fractionalDigits = useFractionalDigits();
  const balanceAtomics = computed(() => {
    if (!wallet.loggedIn.value) {
      return '0';
    }
    const balances = balanceFetcher.balances.value[wallet.address.value];
    return balances?.find(x => x.denom === 'uphoton')?.amount ?? '0';
  });
  const configStore = useConfigStore();
  const balanceDecimal = computed(() => Decimal.fromAtomics(balanceAtomics.value, fractionalDigits));
  const isDefaultAmountInvalid = computed(() =>
    configStore.config.defaultAmountEnabled
    && balanceDecimal.value.isLessThan(
      Decimal.fromAtomics(configStore.config.defaultAmountAtomics, fractionalDigits),
    ),
  );
  return { isDefaultAmountInvalid };
}
