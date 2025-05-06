<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { Moon, Sun } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';

const mode = useColorMode();
</script>

<template>
  <Button @click="mode = mode === 'dark' ? 'light' : 'dark'" class="size-10">
    <component :is="mode === 'dark' ? Moon : Sun" class="size-5" />
  </Button>
</template>
