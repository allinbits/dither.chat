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

const props = defineProps<{ post: Post; showTimeline?: boolean }>();
const { data: cachedPost } = usePost({ hash: ref(props.post.hash) });
// If the post is not found in the cache (Ex: After a reply creation), we can still use the original post
const usedPost = computed(() => cachedPost.value || props.post);

</script>

<template>
  <RouterLink v-if="usedPost" :to="`/post/${usedPost.hash}`" custom v-slot="{ navigate }">
    <div @click="navigate"
      :class="cn('flex flex-row gap-3 cursor-pointer pb-2 pt-4 pl-4 pr-2 relative hover:bg-accent/30 active:bg-accent/30 transition-colors', !showTimeline && 'border-b')">
      <div :class="cn('w-[40px] h-full flex flex-col items-center absolute', !showTimeline && 'hidden')">
        <div class="w-[3px] bg-border h-full" />
      </div>

      <div class="flex flex-row gap-3 w-full">
        <div data-testid="post-avatar">
          <div :class="cn('w-[40px] h-full flex flex-col items-center absolute', !showTimeline && 'hidden')">
            <div class="w-[3px] bg-border h-full" />
          </div>
          <RouterLink :to="`/profile/${usedPost.author}`">
            <UserAvatar :userAddress="usedPost.author" />
          </RouterLink>
        </div>

        <div class="flex flex-col w-full gap-3">
          <div class="flex flex-row justify-between">
            <div class="flex items-center gap-3">
              <RouterLink :to="`/profile/${usedPost.author}`">
                <Username :userAddress="usedPost.author" />
              </RouterLink>
              <PrettyTimestamp :timestamp="new Date(usedPost.timestamp)" />
            </div>
            <PostMoreActions :post="usedPost" />
          </div>

          <PostContent :message="usedPost.message" />
          <PostActions :post="usedPost" class="-ml-2 mt-2" />
        </div>
      </div>

    </div>
  </RouterLink>
</template>
