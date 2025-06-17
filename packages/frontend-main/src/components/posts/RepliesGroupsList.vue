<script lang="ts" setup>

import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import type { Post, ReplyWithParent } from 'api-main/types/feed';

import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import Button from '../ui/button/Button.vue';

import RepliesGroupItem from './RepliesGroupItem.vue';

import { cn } from '@/utility';

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

    <span v-else-if="!repliesGroups.length" class="self-center mt-4 text-md font-semibold text-base">{{
      $t('components.RepliesGroupsList.empty') }}</span>

    <RepliesGroupItem v-else v-for="repliesGroup in repliesGroups" :key="repliesGroup.parent.hash"  :repliesGroup="repliesGroup" class="p-4" />

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin " />
      <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
              variant="outline">
        {{ $t('components.Button.showMore') }}
      </Button>
    </div>
  </div>
</template>
