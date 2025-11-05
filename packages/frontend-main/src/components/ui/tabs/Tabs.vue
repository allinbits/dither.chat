<script setup lang="ts">
import type { TabVariants } from '.';

import { RouterLink, useRoute } from 'vue-router';

import { cn } from '@/utility';

import { tabVariants } from '.';

export interface Tab {
  label: string;
  to: string;
}

const props = withDefaults(
  defineProps<{
    tabs: Tab[];
    size?: TabVariants['size'];
    layout?: TabVariants['layout'];
  }>(),
  {
    size: 'default',
    layout: 'default',
  },
);

const route = useRoute();

function isActive(tab: Tab) {
  return route.path === tab.to;
}
</script>

<template>
  <div
    class="inline-flex items-center text-muted-foreground w-full justify-start rounded-none border-b bg-transparent p-0"
    role="tablist"
    aria-orientation="horizontal"
  >
    <RouterLink
      v-for="tab in props.tabs"
      :key="tab.to"
      :to="tab.to"
      :class="cn(
        tabVariants({
          size: props.size,
          layout: props.layout,
          state: isActive(tab) ? 'active' : 'inactive',
        }),
      )"
      role="tab"
      :aria-selected="isActive(tab)"
      :data-state="isActive(tab) ? 'active' : 'inactive'"
    >
      <span class="truncate">{{ tab.label }}</span>
    </RouterLink>
  </div>
</template>
