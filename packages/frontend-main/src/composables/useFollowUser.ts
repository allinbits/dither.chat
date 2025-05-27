import type { FollowUser } from 'api-main/types/follows';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { useWallet } from './useWallet';

interface FollowUserRequestMutation {
    userAddress: string;
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
            const result = await wallet.dither.follow(userAddress, BigInt(photonValue).toString());
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
        },
        onMutate: async () => {
            const followingOpts = following({ userAddress: wallet.address });
            const followingPostsOpts = followingPosts({ userAddress: wallet.address });

            await queryClient.cancelQueries(followingOpts);
            await queryClient.cancelQueries(followingPostsOpts);

            const previousFollowing = queryClient.getQueryData(
                followingOpts.queryKey,
            ) as InfiniteData<FollowUser[], unknown> | undefined;

            // TODO: Handle following posts?
            // const previousFollowingPosts = queryClient.getQueryData(
            //     followingOpts.queryKey,
            // ) as InfiniteData<Post[], unknown> | undefined;

            return { previousFollowing,
                // , previousFollowingPosts
            };
        },
        onSuccess: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            const optimisticNewFollowUser: FollowUser = { address: variables.userAddress };

            const newPages = context.previousFollowing?.pages ? [...context.previousFollowing.pages] : [];
            if (newPages.length > 0) {
                newPages[0] = [optimisticNewFollowUser, ...newPages[0]];
            }
            else {
                newPages.push([optimisticNewFollowUser]);
            }
            const newFollowingData: InfiniteData<FollowUser[], unknown> = {
                pages: newPages,
                pageParams: context.previousFollowing?.pageParams ?? [0],
            };

            // const followingPostsOpts = followingPosts({ userAddress: wallet.address});
            queryClient.setQueryData(followingOpts.queryKey, newFollowingData);

            // TODO: Handle following posts?
            // queryClient.setQueryData(repliesOpts.queryKey, newFollowingPostsData);
        },
        onError: (_, __, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
            // queryClient.setQueryData(followingPostsOpts.queryKey, context?.previousFollowingPosts);
        },
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
