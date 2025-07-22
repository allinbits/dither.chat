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
    useTxNotification(isToastShown, 'Unfollow', txSuccess, txError);

    const {
        mutateAsync,
    } = useMutation({
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
        onMutate: async (variables) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingOpts = following({ userAddress: wallet.address });

            await Promise.all([
                await queryClient.cancelQueries(isFollowingOpts),
                await queryClient.cancelQueries(followingOpts),
            ]);

            const previousIsFollowing = queryClient.getQueryData(
                isFollowingOpts.queryKey,
            ) as boolean | undefined;
            const previousFollowing = queryClient.getQueryData(
                followingOpts.queryKey,
            ) as InfiniteData<Following[], unknown> | undefined;

            return {
                previousIsFollowing,
                previousFollowing,
            };
        },
        onSuccess: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingOpts = following({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            const newFollowingData = infiniteDataWithoutItem<Following>({
                previousItems: context.previousFollowing,
                predicate: followUser => followUser.address === variables.userAddress.value,
            });

            queryClient.setQueryData(isFollowingOpts.queryKey, false);
            queryClient.setQueryData(followingOpts.queryKey, newFollowingData);
            queryClient.invalidateQueries(followingPostsOpts);
        },
        onError: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingOpts = following({ userAddress: wallet.address });

            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
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
