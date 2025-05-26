<script setup lang="ts">
import { useWallet } from '@/composables/useWallet';

import BottomPanel from './panels/BottomPanel.vue';
import TopPanel from './panels/TopPanel.vue';
const wallet = useWallet();

</script>

<template>
  <div class="w-full h-[58px] sticky top-0 z-99">
    <TopPanel />
  </div>

  <main class="h-[100vh]">
    <slot />
  </main>

  <div v-if="wallet.loggedIn.value" class="w-full h-[58px] sticky bottom-0 z-99">
    <BottomPanel />
  </div>
</template>
