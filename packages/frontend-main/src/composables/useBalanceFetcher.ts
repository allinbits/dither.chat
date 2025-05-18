import { ref } from 'vue';

import chainConfig from '@/chain-config.json';

type BalanceData = { [address: string]: Array<{ amount: string; denom: string }> };

const balances = ref<BalanceData>({});

export function useBalanceFetcher() {
    const updateAddress = async (address: string) => {
        const results = await fetch(`${chainConfig.rest}cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`).then(response => response.json());
        if (!results) {
            return false;
        }

        balances.value[address] = results.balances;
        return true;
    };

    return {
        balances,
        updateAddress,
    };
}
