import type { Notification } from 'api-main/types/notifications';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

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
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ notification }: FollowUserRequestMutation) => {
            const resVerifyRaw = await fetch(apiRoot + `/notification-read?hash=${notification.hash}&address=${wallet.address}`, {
                method: 'GET',
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
        onMutate: async () => {
            const notificationsOpts = notifications({ userAddress: wallet.address });
            const notificationsCountOpts = notificationsCount({ userAddress: wallet.address });

            await Promise.all([
                queryClient.cancelQueries(notificationsOpts),
                queryClient.cancelQueries(notificationsCountOpts),
            ]);

            const previousNotifications = queryClient.getQueryData(
                notificationsOpts.queryKey,
            ) as InfiniteData<Notification[], unknown> | undefined;
            const previousNotificationsCount = queryClient.getQueryData(
                notificationsCountOpts.queryKey,
            ) as number;

            return {
                previousNotifications,
                previousNotificationsCount,
            };
        },
        onSuccess: (_, variables, context) => {
            const notificationsOpts = notifications({ userAddress: wallet.address });
            const notificationsCountOpts = notificationsCount({ userAddress: wallet.address });

            const newNotificationsData = infiniteDataWithoutItem<Notification>({
                previousItems: context.previousNotifications,
                predicate: notification => notification.hash === variables.notification.hash,
            });

            queryClient.setQueryData(notificationsOpts.queryKey, newNotificationsData);
            queryClient.setQueryData(notificationsCountOpts.queryKey, context?.previousNotificationsCount - 1);
        },
        onError: (_, __, context) => {
            const notificationsOpts = notifications({ userAddress: wallet.address });
            const notificationsCountOpts = notificationsCount({ userAddress: wallet.address });

            queryClient.setQueryData(notificationsOpts.queryKey, context?.previousNotifications);
            queryClient.setQueryData(notificationsCountOpts.queryKey, context?.previousNotificationsCount);
        },
    });

    return {
        readNotification: mutateAsync,
        txError,
        txSuccess,
    };
}
