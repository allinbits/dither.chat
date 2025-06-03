<script setup lang="ts">

import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import { SearchInput } from '@/components/ui/search';

</script>

<template>
  <aside class="flex flex-col h-full w-full gap-8 p-6">
    <!-- TODO: Find a better place for this button -->
    <ToggleThemeButton />
    <SearchInput />
    <FilterPhoton />
  </aside>
</template>
