<script setup lang="ts">
import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import { SearchInput } from '@/components/ui/search';
import ColorModeSwitch from '@/components/ui/switch/ColorModeSwitch.vue';
</script>

<template>
  <aside class="flex flex-col h-full w-full max-w-[358px] gap-8 p-6">
    <ColorModeSwitch />
    <FilterPhoton />
    <SearchInput />
  </aside>
</template>
