import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { isFollowing } from './useIsFollowing';
import { useWallet } from './useWallet';
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
            const result = await wallet.dither.send(
                'Flag',
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

            await queryClient.cancelQueries(isFollowingOpts);

            const previousIsFollowing = queryClient.getQueryData(
                isFollowingOpts.queryKey,
            ) as boolean | undefined;

            return {
                previousIsFollowing,
            };
        },
        onSuccess: (_, variables) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            queryClient.setQueryData(isFollowingOpts.queryKey, true);
        },
        onError: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
        },
    });

    return {
        followUser: mutateAsync,
        txError,
        txSuccess,
    };
}
