import { h, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Check, ExternalLink, Loader, X } from 'lucide-vue-next';

import { useWallet } from './useWallet';

import { useConfigStore } from '@/stores/useConfigStore';

export const useTxNotification = (
    enabled: Ref<boolean>,
    txLabel: string,
    txSuccess: Ref<string | undefined>,
    txError: Ref<string | undefined>,
) => {
    const configStore = useConfigStore();
    const explorerURL = configStore.envConfig.explorerUrl ?? 'https://testnet.explorer.allinbits.services/atomone-devnet-1/tx';

    const wallet = useWallet();
    const { t } = useI18n();

    const broadcastToastId = ref<string | number | undefined>();

    watch(wallet.processState, (newState) => {
        if (newState === 'broadcasting' && enabled.value) {
            broadcastToastId.value = toast.info(h('span', { class: 'ml-2 font-semibold text-sm' }, t('components.Toast.broadcasting')), {
                cancelButtonStyle: { width: 100 },
                description: h('span', { class: 'ml-2 text-sm' }, t('components.Toast.wait')),
                icon: h(Loader, { class: 'animate-spin' }),
                duration: Infinity, // stays until dismissed
            });
        }
    });

    watch(txSuccess, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }

            toast.success(h('span', { class: 'ml-2 font-semibold text-sm' }, t('components.Toast.success', { txLabel })), {
                description: h(
                    'div',
                    {
                        class: 'flex items-center gap-2 ml-2 underline cursor-pointer',
                        onClick: () => window.open(`${explorerURL}/${newValue}`, '_blank'),
                    },
                    [
                        h('span', { class: 'text-sm' }, t('components.Button.viewOnExplorer')),
                        h(ExternalLink, { class: 'text-green-500 size-4' }),
                    ],
                ),
                icon: h(Check, { class: 'text-green-500' }),
                duration: 10_000,
            });
        }
    });

    watch(txError, (newValue) => {
        if (newValue) {
            if (broadcastToastId.value) {
                toast.dismiss(broadcastToastId.value);
            }

            toast.error(h('span', { class: 'ml-2 font-semibold text-sm' }, t('components.Toast.fail', { txLabel })), {
                description: h('span', { class: 'ml-2 text-sm' }, newValue),
                icon: h(X, { class: 'text-red-500' }),
                duration: 5_000,
            });
        }
    });
};
