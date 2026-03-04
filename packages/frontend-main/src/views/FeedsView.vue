<script setup lang="ts">
import { ChevronRight, Inbox, Loader, Rss } from 'lucide-vue-next';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useFeeds } from '@/composables/useFeeds';
import MainLayout from '@/layouts/MainLayout.vue';
import { shorten } from '@/utility/text';

import ViewHeading from './ViewHeading.vue';

const { data: feeds, isLoading } = useFeeds();
</script>

<template>
  <MainLayout>
    <div class="flex flex-col flex-1">
      <ViewHeading :title="$t('components.Headings.feeds')" />

      <div class="flex flex-col flex-1">
        <Loader v-if="isLoading" class="animate-spin w-full m-auto" />

        <Empty v-else-if="!feeds?.length">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox class="size-6" />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>
            {{ $t('components.FeedsList.empty') }}
          </EmptyTitle>
        </Empty>

        <div v-else class="flex flex-col">
          <RouterLink
            v-for="feed in feeds"
            :key="feed.slug"
            :to="`/feed/${feed.slug}`"
            class="flex flex-col border-b hover:bg-accent/50 transition-colors"
          >
            <div class="flex flex-row items-center gap-3 p-4 pb-2">
              <div class="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rss class="size-5 text-primary" />
              </div>

              <div class="flex flex-col flex-1 min-w-0 gap-1">
                <span class="font-semibold text-foreground truncate">
                  {{ feed.name }}
                </span>
                <span class="text-xs text-muted-foreground truncate">
                  {{ feed.author ? $t('components.FeedsList.by', { author: shorten(feed.author, 8, 4) }) : $t('components.FeedsList.featuredFeed') }}
                </span>
              </div>

              <ChevronRight class="flex-shrink-0 size-5 text-muted-foreground" />
            </div>

            <p v-if="feed.description" class="text-sm text-foreground px-4 pb-4 line-clamp-2">
              {{ feed.description }}
            </p>
          </RouterLink>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
