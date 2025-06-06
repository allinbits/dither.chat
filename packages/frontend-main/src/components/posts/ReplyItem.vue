<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostItem from './PostItem.vue';

import { cn } from '@/utility';

const props = defineProps<{ reply: Post; hideBorder?: boolean; showTimeline?: boolean }>();

const { data: reply } = usePost({ hash: ref(props.reply.hash) });

</script>

<template>
  <PostItem v-if="reply" :post="reply" hideBorder :showTimeline="showTimeline" />
  <div :class="cn('w-[40px] flex flex-col items-center', !showTimeline && 'hidden')">
    <PostT class="w-[3px] bg-border h-4" />
  </div>
</template>
