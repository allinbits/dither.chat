<script lang="ts" setup>
import type { UserAvatarUsernameProps } from './UserAvatarUsername.vue';

import { computed } from 'vue';

import { cn } from '@/utility';
import { shorten } from '@/utility/text';

const { userAddress, userHandle } = defineProps<UserAvatarUsernameProps>();

const display = computed(() => shorten(userAddress || '...............', 8, 4));
</script>

<template>
  <div class="flex flex-col text-left">
    <div :class="cn(size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base', !disabled && 'active:underline hover:underline decoration-2', 'font-semibold')" :title="userAddress">
      {{ display }}
    </div>
    <div v-if="userHandle" :class="cn(size === 'lg' ? 'text-sm' : 'text-xs')">
      @{{ userHandle }}
    </div>
  </div>
</template>
