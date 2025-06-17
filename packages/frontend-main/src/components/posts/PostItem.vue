<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostContent from './PostContent.vue';
import PostMoreActions from './PostMoreActions.vue';

import { cn } from '@/utility';
import { formatAmount } from '@/utility/text';

const props = defineProps<{ post: Post; hideBorder?: boolean; showTimeline?: boolean }>();
const { data: cachedPost } = usePost({ hash: ref(props.post.hash) });
// If the post is not found in the cache (Ex: After a reply creation), we can still use the original post
const usedPost = computed(() => cachedPost.value || props.post);

</script>

<template>
  <RouterLink v-if="usedPost" :to="`/post/${usedPost.hash}`" custom v-slot="{ navigate }">
    <div :class="cn('flex flex-row gap-3 cursor-pointer', !hideBorder && 'border-b' )">
      <div class="flex flex-col items-center">
        <RouterLink :to="`/profile/${usedPost.author}`">
          <UserAvatar :userAddress="usedPost.author" />
        </RouterLink>
        <div :class="cn('w-[3px] h-full bg-border', !showTimeline && 'hidden')" />
      </div>

      <div class="flex flex-col w-full gap-3" @click="navigate">
        <div class="flex flex-row justify-between items-center h-[40px]">
          <div class="flex flex-row gap-3">
            <RouterLink :to="`/profile/${usedPost.author}`">
              <Username :userAddress="usedPost.author" />
            </RouterLink>
            <PrettyTimestamp :timestamp="new Date(usedPost.timestamp)" />
          </div>
          <PostMoreActions :post="usedPost" />
        </div>
        <PostContent :message="usedPost.message" />
        <span class="text-xs w-full text-right text-neutral-400">{{ formatAmount(usedPost.quantity, 6) }} PHOTON</span>
        <PostActions :post="usedPost" class="mt-4"/>
      </div>
    </div>
  </RouterLink>
</template>
