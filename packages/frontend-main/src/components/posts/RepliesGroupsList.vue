<script lang="ts" setup>
import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { Loader, MessageCircle } from 'lucide-vue-next';
import { computed } from 'vue';

import { cn } from '@/utility';

import Button from '../ui/button/Button.vue';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import RepliesGroupItem from './RepliesGroupItem.vue';

export interface RepliesGroup {
  parent: Post;
  replies: Post[];
}
type RepliesInfiniteQueryReturnType = UseInfiniteQueryReturnType<InfiniteData<ReplyWithParent[], unknown>, Error>;
const props = defineProps<{ query: RepliesInfiniteQueryReturnType }>();
const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = props.query;

const repliesGroups = computed(() => {
  const flatReplies = data.value?.pages.flat() ?? [];
  const repliesGroups = new Map<string, RepliesGroup>();
  for (const item of flatReplies) {
    const parentHash = item.parent.hash;
    if (!repliesGroups.has(parentHash)) {
      repliesGroups.set(parentHash, { parent: item.parent, replies: [] });
    }
    repliesGroups.get(parentHash)!.replies.push(item.reply);
  }
  return Array.from(repliesGroups.values());
});
</script>

<template>
  <div :class="cn('flex flex-col w-full', repliesGroups.length && 'border-t')">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <Empty v-else-if="!repliesGroups.length" class="mt-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircle class="size-6" />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>
        {{ $t('components.RepliesGroupsList.empty') }}
      </EmptyTitle>
    </Empty>

    <RepliesGroupItem v-for="repliesGroup in repliesGroups" v-else :key="repliesGroup.parent.hash" :replies-group="repliesGroup" />

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin " />
      <Button
        v-if="hasNextPage && !isFetchingNextPage" size="sm" class="w-full text-sm" variant="outline"
        @click="fetchNextPage"
      >
        {{ $t('components.Button.showMore') }}
      </Button>
    </div>
  </div>
</template>
