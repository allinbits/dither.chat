<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostMessage from './PostMessage.vue';
import PostMoreActions from './PostMoreActions.vue';

import { cn } from '@/utility';
import { formatAmount } from '@/utility/text';

const props = defineProps<{ post: Post; hideBorder?: boolean; showTimeline?: boolean }>();
const { data: post } = usePost({ hash: ref(props.post.hash) });

</script>

<template>
  <RouterLink v-if="post" :to="`/post/${post.hash}`" custom v-slot="{ navigate }">
    <div :class="cn('flex flex-row gap-3 cursor-pointer', !hideBorder && 'border-b' )">
      <div class="flex flex-col items-center">
        <RouterLink :to="`/profile/${post.author}`">
          <UserAvatar :userAddress="post.author" />
        </RouterLink>
        <div :class="cn('w-[3px] h-full bg-border', !showTimeline && 'hidden')" />
      </div>

      <div class="flex flex-col w-full gap-3" @click="navigate">
        <div class="flex flex-row justify-between items-center h-[40px]">
          <div class="flex flex-row gap-3">
            <RouterLink :to="`/profile/${post.author}`">
              <Username :userAddress="post.author" />
            </RouterLink>
            <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
          </div>
          <PostMoreActions :post="post" />
        </div>
        <PostMessage :post="post" />
        <span class="text-xs w-full text-right text-neutral-400">{{ formatAmount(post.quantity, 6) }} PHOTON</span>
        <PostActions :post="post" />
      </div>
    </div>
  </RouterLink>
</template>
