import type { FollowUser } from 'api-main/types/follows';

import { ref } from 'vue';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/vue-query';

import { following } from './useFollowing';
import { followingPosts } from './useFollowingPosts';
import { useWallet } from './useWallet';

interface UnfollowUserRequestMutation {
    userAddress: string;
    photonValue: number;
}

export function useUnfollowUser(
) {
    const queryClient = useQueryClient();
    const wallet = useWallet();
    const txError = ref<string>();
    const txSuccess = ref<string>();
    // const buildNewFollowUser = (address: string, hash): Post => ({
    //     address: '',
    //     // hash: '',
    // });

    const {
        mutateAsync,
    } = useMutation({
        mutationFn: async ({ userAddress, photonValue }: UnfollowUserRequestMutation) => {
            console.log('userAddress', userAddress, 'photonValue', photonValue);
            const result = await wallet.dither.follow(userAddress, BigInt(photonValue).toString());
            console.log('resultresult', result);
            if (!result.broadcast) {
                txError.value = result.msg;
                throw new Error(result.msg);
            }
            txSuccess.value = result.tx?.transactionHash;
            // if (txSuccess.value) {
            //     return txSuccess.value;
            // }
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

            return {
                previousFollowing,
                // , previousFollowingPosts
            };
        },
        onSuccess: (_, variables, context) => {
            const followingOpts = following({ userAddress: wallet.address });

            const optimisticFollowUserToRemove = variables.userAddress;

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
        },
        onError: (_, __, context) => {
            const followingOpts = following({ userAddress: wallet.address });
            queryClient.setQueryData(followingOpts.queryKey, context?.previousFollowing);
            // queryClient.setQueryData(followingPostsOpts.queryKey, context?.previousFollowingPosts);
        },
    });

    return {
        unfollowUser: mutateAsync,
        txError,
        txSuccess,
    };
}
