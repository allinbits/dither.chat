import { Decimal } from '@cosmjs/math';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { fractionalDigits } from '@/utility/atomics';

export const useFiltersStore = defineStore(
  'filtersStateStore',
  () => {
    const filterAmountAtomics = ref(Decimal.fromAtomics('1', fractionalDigits).atomics);

    const setFilterAmountAtomics = (newAmount: string) => {
      filterAmountAtomics.value = newAmount;
    };

    return { setFilterAmountAtomics, filterAmountAtomics };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['filterAmountAtomics'],
    },
  },
);
