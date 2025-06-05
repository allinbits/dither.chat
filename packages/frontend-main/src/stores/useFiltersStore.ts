import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useFiltersStore = defineStore(
    'filtersStateStore',
    () => {
        const minSendAmount = ref(0);

        const setMinSendAmount = (sendAmount: number) => {
            minSendAmount.value = sendAmount;
        };

        return { setMinSendAmount, minSendAmount };
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['minSendAmount'],
        },
    },
);
