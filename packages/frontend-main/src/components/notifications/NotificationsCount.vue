<script lang="ts" setup>
import { useNotificationsCount } from '@/composables/useNotificationsCount';
import { useWallet } from '@/composables/useWallet';

import { formatCompactNumber } from '@/utility/text';
const wallet = useWallet();

const { data: count } = useNotificationsCount({ userAddress: wallet.address });

</script>

<template>
  <div v-if="count && count > 0" class="flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 border-1 border-background text-white text-xs font-medium  ">
    {{ formatCompactNumber(count) }}
  </div>
</template>
