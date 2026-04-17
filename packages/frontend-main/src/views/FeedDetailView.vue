<script setup lang="ts">
import { ArrowLeft, Rss } from 'lucide-vue-next';
import { computed, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PostsList from '@/components/posts/PostsList.vue';
import { useFeedBySlug } from '@/composables/useFeedBySlug';
import { useFeeds } from '@/composables/useFeeds';
import MainLayout from '@/layouts/MainLayout.vue';
import { shorten } from '@/utility/text';

const route = useRoute();
const { back } = useRouter();
const slug = toRef(() => route.params.slug as string);

const query = useFeedBySlug({ slug });
const { data: feeds } = useFeeds();

const feedInfo = computed(() => feeds.value?.find(f => f.slug === slug.value));
</script>

<template>
  <MainLayout>
    <div class="flex flex-col flex-1">
      <div class="flex flex-row items-center w-full border-b px-2 min-h-[62px] gap-3">
        <button class="flex flex-row items-center gap-1 p-2 rounded-full hover:bg-accent active:bg-accent transition-colors" @click="back">
          <ArrowLeft class="size-6" />
        </button>

        <div class="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Rss class="size-5 text-primary" />
        </div>

        <div class="flex flex-col flex-1 min-w-0 py-2">
          <span class="font-semibold text-foreground truncate">
            {{ feedInfo?.name ?? slug }}
          </span>
          <span v-if="feedInfo?.author" class="text-sm text-muted-foreground truncate">
            {{ $t('components.FeedsList.by', { author: shorten(feedInfo.author, 8, 4) }) }}
          </span>
        </div>
      </div>

      <p v-if="feedInfo?.description" class="text-sm text-muted-foreground p-4 border-b bg-accent/20">
        {{ feedInfo.description }}
      </p>

      <PostsList :query="query" />
    </div>
  </MainLayout>
</template>
