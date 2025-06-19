import { h, type Ref, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { useWallet } from './useWallet';

import ToastBroadcasting from '@/components/ui/sonner/ToastBroadcasting.vue';
import ToastError from '@/components/ui/sonner/ToastError.vue';
import ToastSuccess from '@/components/ui/sonner/ToastSuccess.vue';

export const useTxNotification = (
    enabled: Ref<boolean>,
    txLabel: string,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const wallet = useWallet();
    const broadcastToastId = ref<string | number | undefined>();

    watch(wallet.processState, (newState) => {
        if (newState === 'broadcasting' && enabled.value) {
            broadcastToastId.value = toast.custom(() =>
                h(ToastBroadcasting, {
                    close: () => toast.dismiss(broadcastToastId.value),
                }),
            {
                duration: Infinity,
            });
        }
    });

    watch(txSuccess, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }
            const successToastId = toast.custom(() =>
                h(ToastSuccess, {
                    txLabel,
                    txHash: newValue,
                    close: () => toast.dismiss(successToastId),
                }),
            {
                duration: 10000,
            });
        }
    });

    watch(txError, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }
            const errorToastId = toast.custom(() =>
                h(ToastError, {
                    txLabel,
                    errorMessage: newValue,
                    close: () => toast.dismiss(errorToastId),
                }),
            {
                duration: 5000,
            });
        }
    });
};
