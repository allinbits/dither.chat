import type { Following } from 'api-main/types/follows';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { isFollowing } from './useIsFollowing';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { infiniteDataWithNewItem, newFollowing } from '@/utility/optimisticBuilders';

interface FollowUserRequestMutation {
    userAddress: Ref<string>;
    amountAtomics: string;
}

export function useFollowUser(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Follow', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, amountAtomics }: FollowUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Follow',
                { args: [userAddress.value], amount: amountAtomics },
            );

            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onSuccess: (_, variables) => {
            const isFollowingOpts = isFollowing({
                followerAddress: wallet.address,
                followingAddress: variables.userAddress,
            });
            const followingOpts = following({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });
            const newFollowingItem: Following = newFollowing({
                address: variables.userAddress.value,
            });

            queryClient.setQueryData(isFollowingOpts.queryKey, () => true);
            queryClient.setQueryData<InfiniteData<Following[]>>(followingOpts.queryKey, current =>
                infiniteDataWithNewItem<Following>({
                    previousItems: current ?? { pages: [], pageParams: [] },
                    newItem: newFollowingItem,
                }),
            );
            queryClient.invalidateQueries(followingPostsOpts);
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
