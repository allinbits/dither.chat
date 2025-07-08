<script lang="ts" setup>
import type { UserAvatarUsernameProps } from './UserAvatarUsername.vue';

import { useColorMode } from '@vueuse/core';

import Avatar from '../ui/avatar/Avatar.vue';
import AvatarFallback from '../ui/avatar/AvatarFallback.vue';
import AvatarImage from '../ui/avatar/AvatarImage.vue';

import { cn } from '@/utility';

defineProps<UserAvatarUsernameProps>();

const mode = useColorMode();

</script>

<template>
  <Avatar :class="cn(size === 'lg' ? 'size-[64px]' : size === 'sm' ? 'size-[32px]' : 'size-[40px]', !disabled && 'active:opacity-60 hover:opacity-60 transition-opacity', 'z-10')">
    <AvatarImage v-if="userAddress" :class="mode === 'dark' && 'filter-[invert(0.96))]'" :src="`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${userAddress}`" alt="user-avatar-image" />
    <AvatarFallback v-else class="bg-[#D9D9D9] size-full"/>
  </Avatar>

</template>
