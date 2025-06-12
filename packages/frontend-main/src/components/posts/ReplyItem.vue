<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostItem from './PostItem.vue';

import { cn } from '@/utility';

const props = defineProps<{ reply: Post; hideBorder?: boolean; showTimeline?: boolean }>();
console.log('ReplyItem received hash:', props.reply.hash);
const { data: cachedReply } = usePost({ hash: ref(props.reply.hash) });
// If the reply post is not found in the cache (Ex: After a reply creation), we can still use the original reply post
const usedReply = computed(() => cachedReply.value || props.reply);

</script>

<template>
  <PostItem v-if="usedReply" :post="usedReply" hideBorder :showTimeline="showTimeline" />
  <div :class="cn('w-[40px] flex flex-col items-center', !showTimeline && usedReply && 'hidden')">
    <div class="w-[3px] bg-border h-4" />
  </div>
</template>
