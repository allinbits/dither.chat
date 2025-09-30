import type { Following } from 'api-main/types/follows';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { isFollowing } from './useIsFollowing';
import { useTxNotification } from './useTxNotification';
import { useWallet } from './useWallet';

import { infiniteDataWithoutItem } from '@/utility/optimisticBuilders';

interface UnfollowUserRequestMutation {
    userAddress: Ref<string>;
    amountAtomics: string;
}

export function useUnfollowUser(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const isToastShown = ref(false);
    useTxNotification('Unfollow', txSuccess, txError);

    const { mutateAsync } = useMutation({
        mutationFn: async ({ userAddress, amountAtomics }: UnfollowUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;
            isToastShown.value = true;

            const result = await wallet.dither.send(
                'Unfollow',
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

            queryClient.setQueryData(isFollowingOpts.queryKey, () => true);
            queryClient.setQueryData<InfiniteData<Following[], unknown>>(
                followingOpts.queryKey,
                current =>
                    infiniteDataWithoutItem<Following>({
                        previousItems: current ?? { pages: [], pageParams: [] },
                        predicate: item => item.address === variables.userAddress.value,
                    }),
            );
            queryClient.invalidateQueries(followingPostsOpts);
        },
        onSettled: () => {
            isToastShown.value = false;
        },
    });

    return {
        unfollowUser: mutateAsync,
        txError,
        txSuccess,
    };
}
