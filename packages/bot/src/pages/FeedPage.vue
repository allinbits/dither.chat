<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFeed } from '@/composables/useDitherAPI';
import PostCard from '@/components/PostCard.vue';
import AppPage from '@/components/AppPage.vue';

const router = useRouter();
const { posts, loading, error, hasMore, loadFeed, refreshFeed } = useFeed();

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

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadFeed(10, false);
  }
};

const handleRefresh = () => {
  refreshFeed();
};

onMounted(() => {
  loadFeed(10, true);
});
</script>

<template>
  <AppPage title="📱 Dither Feed" :back="false">
    <div class="feed-page">
      <div class="feed-page__header">
        <h2 class="feed-page__title">Latest Posts</h2>
        <button 
          class="feed-page__refresh"
          @click="handleRefresh"
          :disabled="loading"
        >
          🔄 Refresh
        </button>
      </div>

      <div v-if="error" class="feed-page__error">
        <p>❌ {{ error }}</p>
        <button @click="handleRefresh" class="feed-page__retry">
          Try Again
        </button>
      </div>

      <div v-else-if="loading && posts.length === 0" class="feed-page__loading">
        <p>Loading posts...</p>
      </div>

      <div v-else-if="posts.length === 0" class="feed-page__empty">
        <p>No posts found. Be the first to post!</p>
      </div>

      <div v-else class="feed-page__posts">
        <PostCard
          v-for="post in posts"
          :key="post.hash"
          :post="post"
          @like="handleLike"
          @dislike="handleDislike"
          @reply="handleReply"
          @view-author="handleViewAuthor"
          @view-post="handleViewPost"
        />
        
        <div v-if="loading" class="feed-page__loading-more">
          <p>Loading more posts...</p>
        </div>
        
        <button 
          v-else-if="hasMore"
          class="feed-page__load-more"
          @click="loadMore"
        >
          Load More Posts
        </button>
        
        <div v-else class="feed-page__end">
          <p>You've reached the end of the feed!</p>
        </div>
      </div>
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
