import type { Ref } from 'vue';

import { h, watch } from 'vue';
import { toast } from 'vue-sonner';

import ToastError from '@/components/ui/sonner/ToastError.vue';
import ToastSuccess from '@/components/ui/sonner/ToastSuccess.vue';

export function useTxNotification(txLabel: string, txSuccess: Ref<string | undefined>, txError: Ref<string | undefined>) {
  watch(txSuccess, (newValue) => {
    if (newValue) {
      const successToastId = toast.custom(
        () =>
          h(ToastSuccess, {
            txLabel,
            txHash: newValue,
            close: () => toast.dismiss(successToastId),
          }),
        {
          duration: 10000,
        },
      );
    }
  });

  watch(txError, (newValue) => {
    if (newValue) {
      const errorToastId = toast.custom(
        () =>
          h(ToastError, {
            txLabel,
            errorMessage: newValue,
            close: () => toast.dismiss(errorToastId),
          }),
        {
          duration: 5000,
        },
      );
    }
  });
}
