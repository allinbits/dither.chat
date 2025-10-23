<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useFeed } from '~/composables/useFeed';
import PostsList from '~/components/PostsList.vue';
import AppPage from '~/components/AppPage.vue';
import { SmartphoneIcon } from 'lucide-vue-next';

const router = useRouter();
const query = useFeed();

const handleLike = (hash: string) => {
  console.log('Liked post:', hash);
  // Post interaction will be handled by PostCard component
};

const handleDislike = (hash: string) => {
  console.log('Disliked post:', hash);
  // Post interaction will be handled by PostCard component
};

const handleReply = (hash: string) => {
  router.push({ name: 'post', params: { hash } });
};

const handleViewAuthor = (address: string) => {
  router.push({ name: 'user', params: { address } });
};

const handleViewPost = (hash: string) => {
  router.push({ name: 'post', params: { hash } });
};
</script>

<template>
  <AppPage :title="`Dither Feed`" :back="false">
    <template #title>
      <div class="flex items-center gap-2">
        <SmartphoneIcon class="w-5 h-5" />
        Dither Feed
      </div>
    </template>
    <div class="w-full">
      <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-foreground">Latest Posts</h2>
      </div>

      <PostsList 
        :query="query"
        @like="handleLike"
        @dislike="handleDislike"
        @reply="handleReply"
        @view-author="handleViewAuthor"
        @view-post="handleViewPost"
      />
    </div>
  </AppPage>
</template>

