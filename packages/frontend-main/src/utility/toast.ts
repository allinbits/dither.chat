import { h } from 'vue';
import { toast } from 'vue-sonner';

import ToastBroadcasting from '@/components/ui/sonner/ToastBroadcasting.vue';
import ToastInfo from '@/components/ui/sonner/ToastInfo.vue';

export function showBroadcastingToast(txLabel: string) {
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
}

export function showInfoToast(title: string, description?: string, duration = 2000) {
  const toastId = toast.custom(
    () =>
      h(ToastInfo, {
        title,
        description,
        close: () => toast.dismiss(toastId),
      }),
    {
      duration,
    },
  );
  return toastId;
}
