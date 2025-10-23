<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '~/composables/useDitherAPI';
import PostCard from '~/components/PostCard.vue';
import AppPage from '~/components/AppPage.vue';

const route = useRoute();
const router = useRouter();
const { user, userPosts, loading, error, loadUser } = useUser();

const userAddress = computed(() => route.params.address as string);

const handleLike = (hash: string) => {
  console.log('Liked post:', hash);
};

const handleDislike = (hash: string) => {
  console.log('Disliked post:', hash);
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

const formatAddress = (address: string) => {
  return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  if (userAddress.value) {
    loadUser(userAddress.value);
  }
});
</script>

<template>
  <AppPage :title="`👤 User Profile`" :back="true">
    <div class="user-page">
      <div v-if="error" class="user-page__error">
        <p>❌ {{ error }}</p>
        <button @click="loadUser(userAddress)" class="user-page__retry">
          Try Again
        </button>
      </div>

      <div v-else-if="loading" class="user-page__loading">
        <p>Loading user profile...</p>
      </div>

      <div v-else-if="user" class="user-page__content">
        <div class="user-page__profile">
          <div class="user-page__avatar">
            <div class="user-page__avatar-placeholder">
              {{ user.username ? user.username.charAt(0).toUpperCase() : '👤' }}
            </div>
          </div>
          
          <div class="user-page__info">
            <h2 class="user-page__username">
              {{ user.username || formatAddress(user.address) }}
            </h2>
            <p class="user-page__address">{{ formatAddress(user.address) }}</p>
            <p class="user-page__joined">
              Joined {{ formatDate(user.joinedAt) }}
            </p>
          </div>
        </div>

        <div class="user-page__stats">
          <div class="user-page__stat">
            <div class="user-page__stat-number">{{ user.posts }}</div>
            <div class="user-page__stat-label">Posts</div>
          </div>
          <div class="user-page__stat">
            <div class="user-page__stat-number">{{ user.followers }}</div>
            <div class="user-page__stat-label">Followers</div>
          </div>
          <div class="user-page__stat">
            <div class="user-page__stat-number">{{ user.following }}</div>
            <div class="user-page__stat-label">Following</div>
          </div>
        </div>

        <div class="user-page__actions">
          <button class="user-page__action user-page__action--follow">
            👤 Follow
          </button>
          <button class="user-page__action user-page__action--share">
            🔗 Share Profile
          </button>
        </div>

        <div class="user-page__posts">
          <h3 class="user-page__posts-title">Recent Posts</h3>
          
          <div v-if="userPosts.length === 0" class="user-page__no-posts">
            <p>No posts yet</p>
          </div>
          
          <div v-else class="user-page__posts-list">
            <PostCard
              v-for="post in userPosts"
              :key="post.hash"
              :post="post"
              :show-author="false"
              @like="handleLike"
              @dislike="handleDislike"
              @reply="handleReply"
              @view-author="handleViewAuthor"
              @view-post="handleViewPost"
            />
          </div>
        </div>
      </div>

      <div v-else class="user-page__not-found">
        <p>User not found</p>
        <button @click="router.back()" class="user-page__back">
          Go Back
        </button>
      </div>
    </div>
  </AppPage>
</template>

<style scoped>
.user-page {
  max-width: 100%;
}

.user-page__error {
  text-align: center;
  padding: 20px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  margin-bottom: 16px;
}

.user-page__error p {
  margin: 0 0 12px 0;
  color: #d32f2f;
}

.user-page__retry {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.user-page__loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.user-page__profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--tg-theme-bg-color, #ffffff);
  border: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  border-radius: 12px;
}

.user-page__avatar {
  flex-shrink: 0;
}

.user-page__avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.user-page__info {
  flex: 1;
  min-width: 0;
}

.user-page__username {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: bold;
  color: var(--tg-theme-text-color, #000000);
  word-break: break-all;
}

.user-page__address {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #666666);
  font-family: monospace;
}

.user-page__joined {
  margin: 0;
  font-size: 12px;
  color: var(--tg-theme-hint-color, #666666);
}

.user-page__stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--tg-theme-bg-color, #ffffff);
  border: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  border-radius: 12px;
}

.user-page__stat {
  text-align: center;
}

.user-page__stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--tg-theme-text-color, #000000);
  margin-bottom: 4px;
}

.user-page__stat-label {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #666666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-page__actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.user-page__action {
  flex: 1;
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-page__action:hover {
  opacity: 0.8;
}

.user-page__action--follow {
  background: #4caf50;
}

.user-page__action--share {
  background: #ff9800;
}

.user-page__posts {
  margin-top: 20px;
}

.user-page__posts-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: var(--tg-theme-text-color, #000000);
}

.user-page__no-posts {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.user-page__not-found {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.user-page__back {
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
}

@media (max-width: 480px) {
  .user-page__profile {
    flex-direction: column;
    text-align: center;
  }
  
  .user-page__actions {
    flex-direction: column;
  }
}
</style>
