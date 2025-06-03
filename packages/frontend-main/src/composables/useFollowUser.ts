import type { Post } from 'api-main/types/feed';
import type { FollowUser } from 'api-main/types/follows';

import { type Ref, ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { isFollowing } from './useIsFollowing';
import { useWallet } from './useWallet';

import { buildNewInfiniteData } from '@/utility/optimisticBuilders';

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
            const result = await wallet.dither.follow(userAddress.value, BigInt(photonValue).toString());
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
            const previousFollowingPosts = queryClient.getQueryData(
                followingOpts.queryKey,
            ) as InfiniteData<Post[], unknown> | undefined;
            const previousIsFollowing = queryClient.getQueryData(
                isFollowingOpts.queryKey,
            ) as boolean | undefined;

            return {
                previousFollowing,
                previousFollowingPosts,
                previousIsFollowing,
            };
        },
        onSuccess: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });
            // const newFollowingUserPosts = userPosts({userAddress: variables.userAddress})

            const optimisticNewFollowUser: FollowUser = { address: variables.userAddress.value };

            // const newPages = context.previousFollowing?.pages ? [...context.previousFollowing.pages] : [];
            // if (newPages.length > 0) {
            //     newPages[0] = [optimisticNewFollowUser, ...newPages[0]];
            // }
            // else {
            //     newPages.push([optimisticNewFollowUser]);
            // }
            const newFollowingData = buildNewInfiniteData<FollowUser>({ previousItems: context.previousFollowing, newItem: optimisticNewFollowUser });

            // const newFollowingData: InfiniteData<FollowUser[], unknown> = {
            //     pages: newPages,
            //     pageParams: context.previousFollowing?.pageParams ?? [0],
            // };*

            // const newFollowingPostsData = buildNewInfiniteData<Post>({ previousItems: context.previousFollowingPosts, newItem: optimisticNewFollowUser });

            // const newPages = context.previousFollowingPosts?.pages ? [...context.previousFollowingPosts.pages] : [];
            // if (newPages.length > 0) {
            //     newPages[0] = [...userPosts({userAddress: variables.userAddress}), ...newPages[0]];
            // }
            // else {
            //     newPages.push([newItem]);
            // }
            // const newData: InfiniteData<T[], unknown> = {
            //     pages: newPages,
            //     pageParams: previousItems?.pageParams ?? [0],
            // };

            // const followingPostsOpts = followingPosts({ userAddress: wallet.address});
            queryClient.setQueryData(followingOpts.queryKey, newFollowingData);

            // TODO: Handle following posts?
            // queryClient.setQueryData(followingPostsOpts.queryKey, newFollowingPostsData);
            queryClient.invalidateQueries(followingPostsOpts);

            queryClient.setQueryData(isFollowingOpts.queryKey, true);
        },
        onError: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
            queryClient.setQueryData(followingPostsOpts.queryKey, context?.previousFollowingPosts);

            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
        },
        retry: false,
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
