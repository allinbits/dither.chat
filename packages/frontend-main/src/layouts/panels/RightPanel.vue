<script setup lang="ts">

import { useRouter } from 'vue-router';

import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import { SearchInput } from '@/components/ui/search';

const router = useRouter();
</script>

<template>
  <aside class="flex flex-col h-full w-full max-w-[358px] gap-8 p-6">
    <!-- TODO: Find a better place for this button -->
    <ToggleThemeButton />
    <SearchInput v-if="router.currentRoute.value.name !== 'Explore'" />
    <FilterPhoton v-if="router.currentRoute.value.name !== 'Explore'" />
  </aside>
</template>
