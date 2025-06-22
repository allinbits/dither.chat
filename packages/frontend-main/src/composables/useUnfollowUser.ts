import { type Ref, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { isFollowing } from './useIsFollowing';
import { useWallet } from './useWallet';
interface UnfollowUserRequestMutation {
    userAddress: Ref<string>;
    atomicPhotonValue: number;
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
        mutationFn: async ({ userAddress, atomicPhotonValue }: UnfollowUserRequestMutation) => {
            txError.value = undefined;
            txSuccess.value = undefined;

            const result = await wallet.dither.send(
                'Unfollow',
                { args: [userAddress.value], amount: BigInt(atomicPhotonValue).toString() },
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
            queryClient.setQueryData(isFollowingOpts.queryKey, false);
        },
        onError: (_, variables, context) => {
            const isFollowingOpts = isFollowing({ followerAddress: wallet.address, followingAddress: variables.userAddress });
            queryClient.setQueryData(isFollowingOpts.queryKey, context?.previousIsFollowing);
        },
    });

    return {
        unfollowUser: mutateAsync,
        txError,
        txSuccess,
    };
}
