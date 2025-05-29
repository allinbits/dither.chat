<script setup lang="ts">

import Filters from '@/components/filters/filters.vue';
import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import { SearchInput } from '@/components/ui/search';

</script>

<template>
  <!-- TODO -->
  <aside
    class="flex flex-col h-full w-full gap-4 p-6">
    <ToggleThemeButton/>
    <SearchInput />
    <Filters />
  </aside>
</template>
