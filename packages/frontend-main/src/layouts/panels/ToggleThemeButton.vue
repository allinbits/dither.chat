<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { Moon, Sun } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';

const mode = useColorMode();
</script>

<template>
  <Button
    class="size-10"
    @click="mode = mode === 'dark' ? 'light' : 'dark'"
  >
    <component
      :is="mode === 'dark' ? Moon : Sun"
      class="size-5"
    />
  </Button>
</template>
