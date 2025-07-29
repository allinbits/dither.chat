import { h } from 'vue';
import { toast } from 'vue-sonner';

import ToastBroadcasting from '@/components/ui/sonner/ToastBroadcasting.vue';

export const showBroadcastingToast = (txLabel: string) => {
    const toastId = toast.custom(
        () =>
            h(ToastBroadcasting, {
                txLabel,
                close: () => toast.dismiss(toastId),
            }),
        {
            duration: Infinity,
        },
    );
    return toastId;
};
