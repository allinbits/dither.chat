<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import { SearchInput } from '@/components/ui/search';
import ColorModeSwitch from '@/components/ui/switch/ColorModeSwitch.vue';
import WalletConnectButton from '@/components/wallet/WalletConnectButton/WalletConnectButton.vue';
import { routesNames } from '@/router';

const router = useRouter();
const isFeedPage = computed(() => {
  const routeName = router.currentRoute.value.name?.toString();
  return routeName === routesNames.home
    || routeName === routesNames.homeFollowing
    || routeName === routesNames.explore;
});
</script>

<template>
  <aside class="flex flex-col h-full w-full max-w-[358px] gap-8 p-6">
    <div class="flex items-center justify-end pt-2">
      <WalletConnectButton />
    </div>

    <div class="flex flex-col gap-4">
      <SearchInput />
    </div>

    <div v-if="isFeedPage" class="flex flex-col gap-4 pt-2 border-t border-border/40">
      <FilterPhoton />
    </div>

    <div class="flex flex-col gap-4 mt-auto pt-4 border-t border-border/40">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Appearance</span>
        <ColorModeSwitch />
      </div>
    </div>
  </aside>
</template>
