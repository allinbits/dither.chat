import { type Ref, watch } from 'vue';

import { useToast } from './useToast';

export const useTxNotification = (txSuccess: Ref<string | undefined>, txError: Ref<string | undefined>) => {
    const { showToast } = useToast();

    watch(txSuccess, () => {
        if (txSuccess.value) {
            showToast('success', 'Success', `Transaction hash: ${txSuccess.value}`, 10_000, {
                label: 'View on explorer',
                onClick: () => {
                    window.open(`https://www.mintscan.io/atomone/tx/${txSuccess.value}`, '_blank');
                },
            });
        }
    });
    watch(txError, () => {
        if (txError.value) {
            showToast('error', 'Error', txError.value, 5_000);
        }
    });
};
