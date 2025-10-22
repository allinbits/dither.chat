<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner';

import { Toaster as Sonner } from 'vue-sonner';

import 'vue-sonner/style.css'; // vue-sonner v2 requires this import

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    }"
  />
</template>
