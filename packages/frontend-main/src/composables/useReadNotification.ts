import type { Notification } from 'api-main/types/notifications';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { notifications } from './useNotifications';
import { useWallet } from './useWallet';

import { useConfigStore } from '@/stores/useConfigStore';
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

            await queryClient.cancelQueries(notificationsOpts);

            const previousNotifications = queryClient.getQueryData(
                notificationsOpts.queryKey,
            ) as InfiniteData<Notification[], unknown> | undefined;

            return {
                previousNotifications,
            };
        },
        onSuccess: (_, variables, context) => {
            const notificationsOpts = notifications({ userAddress: wallet.address });

            const previousNotificationsPages = context.previousNotifications?.pages ?? [];
            const newNotificationsPages = previousNotificationsPages.map(page =>
                page.filter(notification => notification.hash !== variables.notification.hash),
            );
            const newNotificationsData: InfiniteData<Notification[], unknown> = {
                pages: newNotificationsPages,
                pageParams: context.previousNotifications?.pageParams ?? [0],
            };

            queryClient.setQueryData(notificationsOpts.queryKey, newNotificationsData);
        },
        onError: (_, __, context) => {
            const notificationsOpts = notifications({ userAddress: wallet.address });
            queryClient.setQueryData(notificationsOpts.queryKey, context?.previousNotifications);
        },
    });

    return {
        readNotification: mutateAsync,
        txError,
        txSuccess,
    };
}
