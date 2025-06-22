<script setup lang="ts">

import { useNotificationsCount } from '@/composables/useNotificationsCount';
import { useWallet } from '@/composables/useWallet';

const wallet = useWallet();
const { data: notificationsCount } = useNotificationsCount({ userAddress: wallet.address });

</script>

<template>
  <div v-if="!!notificationsCount" class="flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 border-1 border-background text-white text-xs font-medium  ">
    {{ notificationsCount }}
  </div>
</template>
