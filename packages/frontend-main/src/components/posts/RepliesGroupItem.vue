<script lang="ts" setup>

import type { RepliesGroup } from './RepliesGroupsList.vue';

import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostMessage from './PostMessage.vue';
import PostMoreActions from './PostMoreActions.vue';

import { cn } from '@/utility';

defineProps<{ repliesGroup: RepliesGroup }>();

</script>

<template>
  <div class="flex flex-col border-b">
    <RouterLink :to="`/post/${repliesGroup.parent.hash}`" custom v-slot="{ navigate }">
      <div class="flex flex-row gap-3 cursor-pointer">
        <div class="flex flex-col items-center">
          <RouterLink :to="`/profile/${repliesGroup.parent.author}`" class="size-[40px]">
            <UserAvatar :userAddress="repliesGroup.parent.author" />
          </RouterLink>
          <div class="w-[3px] h-full bg-border" />
        </div>

        <div class="flex flex-col w-full gap-3 mb-8" @click="navigate">
          <div class="flex flex-row justify-between items-center">
            <div class="flex flex-row gap-3 pt-2.5">
              <RouterLink :to="`/profile/${repliesGroup.parent.author}`">
                <Username :userAddress="repliesGroup.parent.author" />
              </RouterLink>
              <PrettyTimestamp :timestamp="new Date(repliesGroup.parent.timestamp)" />
            </div>
            <PostMoreActions :post="repliesGroup.parent" />
          </div>
          <PostMessage :message="repliesGroup.parent.message" />
          <PostActions :post="repliesGroup.parent" />
        </div>
      </div>
    </RouterLink>

    <RouterLink v-for="(reply, index) in repliesGroup.replies" :key="index"  :to="`/post/${reply.hash}`" custom v-slot="{ navigate }">
      <div class="flex flex-row gap-3 cursor-pointer">
        <div class="flex flex-col items-center">
          <RouterLink :to="`/profile/${reply.author}`" class="size-[40px]">
            <UserAvatar :userAddress="reply.author" />
          </RouterLink>
          <div :class="cn('w-[2px] h-full bg-border', index === repliesGroup.replies.length - 1 && 'hidden')" />
        </div>

        <div class="flex flex-col w-full gap-3 not-last:mb-8" @click="navigate">
          <div class="flex flex-row justify-between items-center">
            <div class="flex flex-row gap-3 pt-2.5">
              <RouterLink :to="`/profile/${reply.author}`">
                <Username :userAddress="reply.author" />
              </RouterLink>
              <PrettyTimestamp :timestamp="new Date(reply.timestamp)" />
            </div>
            <PostMoreActions :post="reply" />
          </div>
          <PostMessage :message="reply.message" />
          <PostActions :post="reply" />
        </div>
      </div>
    </RouterLink>
  </div>
</template>
