<script lang="ts" setup>

import type { RepliesGroup } from './RepliesGroupsList.vue';

import { computed, ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostItem from './PostItem.vue';
import ReplyItem from './ReplyItem.vue';

const props = defineProps<{ repliesGroup: RepliesGroup }>();
const { data: cachedParentPost } = usePost({ hash: ref(props.repliesGroup.parent.hash) });
// If the parent post is not found in the cache (Ex: After a reply creation), we can still use the original parent post
const usedParentPost = computed(() => cachedParentPost.value || props.repliesGroup.parent);

</script>

<template>
  <div v-if="usedParentPost" class="flex flex-col border-b">
    <PostItem :post="usedParentPost" showTimeline hideBorder/>
    <div class="w-[40px] flex flex-col items-center">
      <div class="w-[3px] bg-border h-4" />
    </div>

    <ReplyItem v-for="(reply, index) in repliesGroup.replies" :key="reply.hash" :reply="reply" :showTimeline="index !== repliesGroup.replies.length - 1"/>
  </div>
</template>
