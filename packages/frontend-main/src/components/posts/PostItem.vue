<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { Repeat2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { usePost } from '@/composables/usePost';
import { cn } from '@/utility';

import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';
import PostContent from './PostContent.vue';
import PostMoreActions from './PostMoreActions.vue';

interface PostWithRepost extends Post {
  reposted_by?: string | null;
  reposted_at?: Date | null;
}

const props = defineProps<{ post: PostWithRepost; showTimeline?: boolean }>();
const { data: cachedPost } = usePost({ hash: ref(props.post.hash) });
// If the post is not found in the cache (Ex: After a reply creation), we can still use the original post
const usedPost = computed(() => cachedPost.value || props.post);
const isRepost = computed(() => !!props.post.reposted_by);
</script>

<template>
  <RouterLink v-if="usedPost" v-slot="{ navigate }" :to="`/post/${usedPost.hash}`" custom>
    <div :class="cn('flex flex-col cursor-pointer pb-2 pt-4 pl-4 pr-2 relative hover:bg-accent/30 active:bg-accent/30 transition-colors', !showTimeline && 'border-b')" @click="navigate">
      <!-- Repost header -->
      <div v-if="isRepost" class="flex items-center gap-2 text-muted-foreground text-sm ml-13 mb-2">
        <Repeat2 class="size-4" />
        <RouterLink :to="`/profile/${post.reposted_by}`" class="hover:underline" @click.stop>
          <Username :user-address="post.reposted_by!" :show-avatar="false" />
        </RouterLink>
        <span>{{ $t('components.PostItem.reposted') }}</span>
      </div>

      <!-- Post content -->
      <div class="flex flex-row gap-3">
        <div :class="cn('w-10 h-full flex flex-col items-center absolute', !showTimeline && 'hidden')">
          <div class="w-0.75 bg-border h-full" />
        </div>

        <div class="flex flex-row gap-3 w-full">
          <div data-testid="post-avatar">
            <div :class="cn('w-10 h-full flex flex-col items-center absolute', !showTimeline && 'hidden')">
              <div class="w-0.75 bg-border h-full" />
            </div>
            <RouterLink :to="`/profile/${usedPost.author}`">
              <UserAvatar :user-address="usedPost.author" />
            </RouterLink>
          </div>

          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row justify-between">
              <div class="flex items-center gap-3">
                <RouterLink :to="`/profile/${usedPost.author}`">
                  <Username :user-address="usedPost.author" />
                </RouterLink>
                <PrettyTimestamp :timestamp="new Date(usedPost.timestamp)" />
              </div>
              <PostMoreActions :post="usedPost" />
            </div>

            <PostContent :message="usedPost.message" />
            <PostActions :post="usedPost" />
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
