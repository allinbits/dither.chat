import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useFiltersStore = defineStore(
    'filtersStateStore',
    () => {
        const filterAmount = ref(0);

        const setFilterAmount = (newAmount: number) => {
            filterAmount.value = newAmount;
        };

        return { setFilterAmount, filterAmount };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['filterAmount'],
        },
    },
);
