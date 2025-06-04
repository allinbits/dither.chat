import { h, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Check, ExternalLink, Loader, X } from 'lucide-vue-next';

import { useWallet } from './useWallet';

const explorerURL
    = import.meta.env.VITE_EXPLORER_URL ?? 'https://testnet.explorer.allinbits.services/atomone-devnet-1/tx';

export const useTxNotification = (
    enabled: Ref<boolean>,
    txLabel: string,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const wallet = useWallet();
    const { t } = useI18n();

    const broadcastToastId = ref<string | number | undefined>();

    watch(wallet.processState, (newState) => {
        if (newState === 'broadcasting' && enabled.value) {
            broadcastToastId.value = toast.info('Broadcasting transaction', {
                description: 'Please wait a moment...',
                icon: () => h(Loader, { class: 'animate-spin mr-2' }),
                duration: Infinity, // stays until dismissed
            });
        }
    });

    watch(txSuccess, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }

            toast.success(`${txLabel} successfully`, {
                description: h(
                    'div',
                    {
                        class: 'flex items-center gap-2 underline cursor-pointer',
                        onClick: () => window.open(`${explorerURL}/${newValue}`, '_blank'),
                    },
                    [
                        h('span', t('components.Button.viewOnExplorer')),
                        h(ExternalLink, { class: 'text-green-500 size-4' }),
                    ],
                ),
                icon: () => h(Check, { class: 'text-green-500' }),
                duration: 10_000,
            });
        }
    });

    watch(txError, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }

            toast.error(`${txLabel} failed`, {
                description: newValue,
                icon: () => h(X, { class: 'text-red-500' }),
                duration: 5_000,
            });
        }
    });
};
