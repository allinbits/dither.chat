import type { FollowUser } from 'api-main/types/follows';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { isFollowing } from './useIsFollowing';
import { useWallet } from './useWallet';

interface UnfollowUserRequestMutation {
    userAddress: Ref<string>;
    photonValue: number;
}

export function useUnfollowUser(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();

    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ userAddress, photonValue }: UnfollowUserRequestMutation) => {
            console.log('userAddress', userAddress, 'photonValue', photonValue);
            const result = await wallet.dither.follow(userAddress.value, BigInt(photonValue).toString());
            console.log('resultresult', result);
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onMutate: async (variables) => {
            const followingOpts = following({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });

            await Promise.all([
                queryClient.cancelQueries(followingOpts),
                queryClient.cancelQueries(followingPostsOpts),
                queryClient.cancelQueries(isFollowingOpts),
            ]);

            const previousFollowing = queryClient.getQueryData(
                followingOpts.queryKey,
            ) as InfiniteData<FollowUser[], unknown> | undefined;

            // TODO: Handle following posts?
            // const previousFollowingPosts = queryClient.getQueryData(
            //     followingOpts.queryKey,
            // ) as InfiniteData<Post[], unknown> | undefined;

            const previousIsFollowing = queryClient.getQueryData(
                isFollowingOpts.queryKey,
            ) as boolean | undefined;

            return {
                previousFollowing,
                // , previousFollowingPosts
                previousIsFollowing,
            };
        },
        onSuccess: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });

            const optimisticFollowUserToRemove = variables.userAddress.value;
            const previousPages = context.previousFollowing?.pages ?? [];
            const newPages = previousPages.map(page =>
                page.filter(user => user.address !== optimisticFollowUserToRemove),
            );
            const newFollowingData: InfiniteData<FollowUser[], unknown> = {
                pages: newPages,
                pageParams: context.previousFollowing?.pageParams ?? [0],
            };

            queryClient.setQueryData(followingOpts.queryKey, newFollowingData);

            // TODO: Handle following posts?

            queryClient.setQueryData(isFollowingOpts.queryKey, false);
        },
        onError: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });

            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
            // queryClient.setQueryData(followingPostsOpts.queryKey, context?.previousFollowingPosts);

            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
        },
    });

    return {
        unfollowUser: mutateAsync,
        txError,
        txSuccess,
    };
}
