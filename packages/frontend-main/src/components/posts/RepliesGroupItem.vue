<script lang="ts" setup>
import type { RepliesGroup } from './RepliesGroupsList.vue';

import { computed, ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostItem from './PostItem.vue';

const props = defineProps<{ repliesGroup: RepliesGroup }>();
const { data: cachedParentPost } = usePost({ hash: ref(props.repliesGroup.parent.hash) });
// If the parent post is not found in the cache (Ex: After a reply creation), we can still use the original parent post
const usedParentPost = computed(() => cachedParentPost.value || props.repliesGroup.parent);
</script>

<template>
  <div v-if="usedParentPost" class="flex flex-col">
    <PostItem :post="usedParentPost" show-timeline class="pb-2 pt-4 pl-4 pr-2" />
    <PostItem v-for="(reply, index) in repliesGroup.replies" :key="reply.hash" :post="reply" :show-timeline="index !== repliesGroup.replies.length - 1" />
  </div>
</template>
