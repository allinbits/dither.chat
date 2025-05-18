<script setup lang="ts">

import { SearchInput } from '@/components/ui/search';
import ToggleThemeButton from '@/components/ui/ToggleThemeButton.vue';
</script>

<template>
  <!-- TODO -->
  <aside
    class="flex flex-col h-full w-full gap-4">
    <ToggleThemeButton/>
    <SearchInput placeholder="Type to search..." />
  </aside>
</template>
