import type { Notification } from 'api-main/types/notifications';

import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { notifications } from './useNotifications';
import { notificationsCount } from './useNotificationsCount';
import { useWallet } from './useWallet';

import { useConfigStore } from '@/stores/useConfigStore';
import { infiniteDataWithoutItem } from '@/utility/optimisticBuilders';
interface FollowUserRequestMutation {
    notification: Notification;
}

export function useReadNotification(
) {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const { mutateAsync } = useMutation({
        mutationFn: async ({ notification }: FollowUserRequestMutation) => {
            const resVerifyRaw = await fetch(apiRoot + `/notification-read?hash=${notification.hash}&address=${wallet.address}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (resVerifyRaw.status !== 200) {
                return;
            }
            const resVerify = await resVerifyRaw.json();
            if (resVerify.status !== 200) {
                return;
            }
        },
        onSuccess: (_, variables) => {
            const notificationsOpts = notifications({ userAddress: wallet.address });
            const notificationsCountOpts = notificationsCount({ userAddress: wallet.address });

            const previousNotifications = queryClient.getQueryData(notificationsOpts.queryKey);
            const previousNotificationsCount = queryClient.getQueryData(notificationsCountOpts.queryKey) || 0;

            const newNotificationsData = infiniteDataWithoutItem<Notification>({
                previousItems: previousNotifications,
                predicate: notification => notification.hash === variables.notification.hash,
            });

            queryClient.setQueryData(notificationsOpts.queryKey, newNotificationsData);
            queryClient.setQueryData(notificationsCountOpts.queryKey, previousNotificationsCount - 1);
        },
    });

    return {
        readNotification: mutateAsync,
        txError,
        txSuccess,
    };
}
