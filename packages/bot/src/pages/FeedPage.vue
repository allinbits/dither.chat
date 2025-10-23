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
    <div class="feed-page">
      <div class="feed-page__header">
        <h2 class="feed-page__title">Latest Posts</h2>
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

<style scoped>
.feed-page {
  max-width: 100%;
}

.feed-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
}

.feed-page__title {
  margin: 0;
  font-size: 20px;
  color: var(--tg-theme-text-color, #000000);
}

.feed-page__refresh {
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.feed-page__refresh:hover {
  opacity: 0.8;
}

.feed-page__refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feed-page__error {
  text-align: center;
  padding: 20px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  margin-bottom: 16px;
}

.feed-page__error p {
  margin: 0 0 12px 0;
  color: #d32f2f;
}

.feed-page__retry {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.feed-page__loading,
.feed-page__loading-more {
  text-align: center;
  padding: 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.feed-page__empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.feed-page__load-more {
  width: 100%;
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  margin: 16px 0;
  transition: opacity 0.2s;
}

.feed-page__load-more:hover {
  opacity: 0.8;
}

.feed-page__end {
  text-align: center;
  padding: 20px;
  color: var(--tg-theme-hint-color, #666666);
  font-style: italic;
}
</style>
