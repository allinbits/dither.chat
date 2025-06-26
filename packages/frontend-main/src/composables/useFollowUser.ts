import type { FollowUser } from 'api-main/types/follows';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { isFollowing } from './useIsFollowing';
import { useWallet } from './useWallet';

import { infiniteDataWithNewItem, newFollowUser } from '@/utility/optimisticBuilders';

interface FollowUserRequestMutation {
    userAddress: Ref<string>;
    photonValue: number;
}

export function useFollowUser(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ userAddress, photonValue }: FollowUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.send(
                'Follow',
                { args: [userAddress.value], amount: BigInt(photonValue).toString() },
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
            ) as InfiniteData<FollowUser[], unknown> | undefined;

            return {
                previousIsFollowing,
                previousFollowing,
            };
        },
        onSuccess: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingOpts = following({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            const optimisticNewFollowUSer: FollowUser = newFollowUser({ address: variables.userAddress.value });
            const newFollowingData = infiniteDataWithNewItem<FollowUser>({
                previousItems: context.previousFollowing,
                newItem: optimisticNewFollowUSer,
            });

            queryClient.setQueryData(isFollowingOpts.queryKey, true);
            queryClient.setQueryData(followingOpts.queryKey, newFollowingData);
            queryClient.invalidateQueries(followingPostsOpts);
        },
        onError: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingOpts = following({ userAddress: wallet.address });

            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
        },
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
