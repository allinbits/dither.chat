<script setup lang="ts">

import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import { SearchInput } from '@/components/ui/search';

</script>

<template>
  <!-- TODO -->
  <aside
    class="flex flex-col h-full w-full gap-4">
    <ToggleThemeButton/>
    <SearchInput />
  </aside>
</template>
