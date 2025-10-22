<script setup lang="ts">
import { useRouter } from 'vue-router';

import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import { SearchInput } from '@/components/ui/search';
import ColorModeSwitch from '@/components/ui/switch/ColorModeSwitch.vue';
import { routesNames } from '@/router';

const router = useRouter();
</script>

<template>
  <aside class="flex flex-col h-full w-full max-w-[358px] gap-8 p-6">
    <ColorModeSwitch />
    <FilterPhoton v-if="router.currentRoute.value.name !== routesNames.explore" />
    <SearchInput v-if="router.currentRoute.value.name !== routesNames.explore" />
  </aside>
</template>
