<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '~/composables/useDitherAPI';
import PostCard from '~/components/PostCard.vue';
import AppPage from '~/components/AppPage.vue';
import { Button, Card, CardContent, CardHeader } from '~/components/ui';
import { UserIcon, CalendarIcon, ShareIcon } from 'lucide-vue-next';

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
    <div class="w-full">
      <!-- Error State -->
      <div v-if="error" class="text-center p-5 bg-red-50 border border-red-200 rounded-lg mb-4">
        <p class="text-red-700 mb-3">❌ {{ error }}</p>
        <Button @click="loadUser(userAddress)" variant="destructive" size="sm">
          Try Again
        </Button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-10 text-muted-foreground">
        <p>Loading user profile...</p>
      </div>

      <!-- User Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Profile Card -->
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {{ user.username ? user.username.charAt(0).toUpperCase() : '👤' }}
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-xl font-semibold text-foreground truncate">
                  {{ user.username || formatAddress(user.address) }}
                </h2>
                <p class="text-sm text-muted-foreground font-mono">
                  {{ formatAddress(user.address) }}
                </p>
                <div class="flex items-center gap-1 mt-1">
                  <CalendarIcon class="w-3 h-3 text-muted-foreground" />
                  <p class="text-xs text-muted-foreground">
                    Joined {{ formatDate(user.joinedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Stats Card -->
        <Card>
          <CardContent class="p-6">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-foreground">{{ user.posts }}</div>
                <div class="text-xs text-muted-foreground uppercase tracking-wide">Posts</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-foreground">{{ user.followers }}</div>
                <div class="text-xs text-muted-foreground uppercase tracking-wide">Followers</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-foreground">{{ user.following }}</div>
                <div class="text-xs text-muted-foreground uppercase tracking-wide">Following</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <div class="flex gap-3">
          <Button class="flex-1" variant="default">
            <UserIcon class="w-4 h-4 mr-2" />
            Follow
          </Button>
          <Button class="flex-1" variant="outline">
            <ShareIcon class="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>

        <!-- Posts Section -->
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold text-foreground">Recent Posts</h3>
          </CardHeader>
          <CardContent>
            <div v-if="userPosts.length === 0" class="text-center py-8 text-muted-foreground">
              <p>No posts yet</p>
            </div>
            <div v-else class="space-y-3">
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
          </CardContent>
        </Card>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-10 text-muted-foreground">
        <p class="mb-4">User not found</p>
        <Button @click="router.back()" variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  </AppPage>
</template>

