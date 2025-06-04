import { type Ref } from 'vue';
import { queryOptions } from '@tanstack/vue-query';

// FIXME: placeholder for now ====================================================
type UserTip = {
    userAddress: string;
    photonValue: number;
    createdAt: string;
};

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';

interface Params {
    userAddress: Ref<string>;
}

export const userTips = (params: Params) =>
    queryOptions({
        queryKey: ['userTips', params.userAddress],
        queryFn: async () => {
            const res = await fetch(`${apiRoot}/userTips?address=${params.userAddress.value}`);
            const json = (await res.json()) as { status: number; rows: UserTip[] };
            return json.rows ?? [];
        },
        enabled: () => !!params.userAddress.value,
        retry: false,
    });
