<script setup lang="ts">

import { useSearchPosts } from '@/composables/useSearchPosts';

import { SearchInput } from '@/components/ui/search';
import ToggleThemeButton from '@/components/ui/ToggleThemeButton.vue';

const { searchPosts, data } = useSearchPosts();

</script>

<template>
  <!-- TODO -->
  <aside
    class="flex flex-col h-full w-full gap-4">
    <ToggleThemeButton/>
    <SearchInput :results="data" placeholder="Type to search..." />
  </aside>
</template>
