<script setup lang="ts">
import { CircleX, Loader } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

import PostItem from '@/components/posts/PostItem.vue';
import { Input } from '@/components/ui/input';
import { useSearchPosts } from '@/composables/useSearchPosts';
import MainLayout from '@/layouts/MainLayout.vue';
import { cn } from '@/utility';

import ViewHeading from './ViewHeading.vue';

// NOTE: even now we have only posts search but we should separate feed vs search
// because later, search could contain more date types than posts
const { query, posts, isLoading, error } = useSearchPosts();

const route = useRoute();
query.value = route.query.q as string;

function clearSearch() {
  query.value = '';
  posts.value = [];
}
</script>

<template>
  <MainLayout>
    <ViewHeading :title="$t('components.Headings.explore')" />

    <div class="search-input flex items-center gap-2 relative">
      <Input v-model="query" class="m-4" :placeholder="$t('placeholders.search')" />

      <CircleX
        v-if="query"
        class="size-6 absolute right-6 cursor-pointer"
        @click="clearSearch"
      />
    </div>

    <div v-if="error" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-else :class="cn('flex flex-col w-full', posts?.length && 'border-t')">
      <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

      <span v-else-if="!posts?.length" class="self-center mt-4 text-md font-semibold text-base">{{
        $t('components.PostsList.empty') }}</span>

      <PostItem v-for="(post, index) in posts" v-else :key="index" :post="post" class="p-4" />
    </div>
  </MainLayout>
</template>
