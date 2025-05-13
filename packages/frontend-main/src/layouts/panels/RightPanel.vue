<script setup lang="ts">

import ToggleThemeButton from '@/components/ui/ToggleThemeButton.vue';

</script>

<template>
  <!-- TODO -->
  <aside
    class="flex flex-col h-full w-full gap-4">
    <ToggleThemeButton/>
    <input placeholder="search" class="bg-neutral-200 p-2 h-[44px]" />
  </aside>
</template>
