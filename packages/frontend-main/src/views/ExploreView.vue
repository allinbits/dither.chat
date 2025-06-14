<script setup lang="ts">
import { useRoute } from 'vue-router';
import { CircleX, Loader } from 'lucide-vue-next';

import { useSearchPosts } from '@/composables/useSearchPosts';

import PostItem from '@/components/posts/PostItem.vue';
import { Input } from '@/components/ui/input';
import MainLayout from '@/layouts/MainLayout.vue';
import { cn } from '@/utility';

const clearSearch = () => {
    query.value = '';
    posts.value = [];
};

// NOTE: even now we have only posts search but we should separate feed vs search
// because later, search could contain more date types than posts
const { query, posts, isLoading, error } = useSearchPosts();

const route = useRoute();
query.value = route.query.q as string;

</script>

<template>
  <MainLayout>
    <div class="search-input flex items-center gap-2 relative">
      <Input class="m-4" v-model="query" :placeholder="$t('placeholders.search')"/>

      <CircleX
        v-if="query"
        @click="clearSearch"
        class="size-6 absolute right-6 cursor-pointer"
      />
    </div>

    <div v-if="error" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-red-500">{{ error.message }}</p>
    </div>

    <div v-else :class="cn('flex flex-col w-full', posts?.length && 'border-t')">
      <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

      <span v-else-if="!posts?.length" class="self-center mt-4 text-md font-semibold text-base">{{
        $t('components.PostsList.empty') }}</span>

      <PostItem v-else v-for="(post, index) in posts" :key="index" :post="post" class="p-4" />
    </div>
  </MainLayout>
</template>
