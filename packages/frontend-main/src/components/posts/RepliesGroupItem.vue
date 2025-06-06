<script lang="ts" setup>

import type { RepliesGroup } from './RepliesGroupsList.vue';

import { ref } from 'vue';

import { usePost } from '@/composables/usePost';

import PostItem from './PostItem.vue';
import ReplyItem from './ReplyItem.vue';

const props = defineProps<{ repliesGroup: RepliesGroup }>();

const { data: parentPost } = usePost({ hash: ref(props.repliesGroup.parent.hash) });

</script>

<template>
  <div v-if="parentPost" class="flex flex-col border-b">
    <PostItem v-if="parentPost" :post="parentPost" showTimeline hideBorder/>
    <div class="w-[40px] flex flex-col items-center">
      <div class="w-[3px] bg-border h-4" />
    </div>

    <ReplyItem v-for="(reply, index) in repliesGroup.replies" :key="index" :reply="reply" :showTimeline="index !== repliesGroup.replies.length - 1"/>
  </div>
</template>
