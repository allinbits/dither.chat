<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '~/composables/useDitherAPI';
import { usePostInteractions } from '~/composables/useDitherAPI';
import { Button, Card, CardContent, CardHeader } from '~/components/ui';

interface Props {
  post: Post;
  showAuthor?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAuthor: true,
  compact: false,
});

const emit = defineEmits<{
  like: [hash: string];
  dislike: [hash: string];
  reply: [hash: string];
  viewAuthor: [address: string];
  viewPost: [hash: string];
}>();

const { loading, likePost, dislikePost } = usePostInteractions();

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatQuantity = (quantity: string) => {
  const num = parseFloat(quantity);
  if (num < 0.001) return `${(num * 1000).toFixed(3)}m PHOTON`;
  return `${num.toFixed(3)} PHOTON`;
};

const handleLike = async () => {
  try {
    await likePost(props.post.hash);
    emit('like', props.post.hash);
  } catch (error) {
    console.error('Failed to like post:', error);
  }
};

const handleDislike = async () => {
  try {
    await dislikePost(props.post.hash);
    emit('dislike', props.post.hash);
  } catch (error) {
    console.error('Failed to dislike post:', error);
  }
};

const handleReply = () => {
  emit('reply', props.post.hash);
};

const handleViewAuthor = () => {
  emit('viewAuthor', props.post.author);
};

const handleViewPost = () => {
  emit('viewPost', props.post.hash);
};

const truncatedContent = computed(() => {
  if (props.compact && props.post.content.length > 100) {
    return props.post.content.substring(0, 100) + '...';
  }
  return props.post.content;
});
</script>

<template>
  <Card class="mb-3" :class="{ 'p-3': compact }">
    <CardHeader class="pb-3">
      <p class="text-base leading-relaxed text-foreground break-words">{{ truncatedContent }}</p>
      
      <div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <div v-if="showAuthor" class="flex items-center gap-1">
          <span>👤</span>
          <Button variant="link" size="sm" @click="handleViewAuthor">
            {{ post.author.substring(0, 8) }}...{{ post.author.substring(post.author.length - 4) }}
          </Button>
        </div>
        
        <div class="flex items-center gap-1">
          <span>⏰</span>
          {{ formatTime(post.timestamp) }}
        </div>
        
        <div class="flex items-center gap-1">
          <span>💎</span>
          {{ formatQuantity(post.quantity) }}
        </div>
      </div>
      
      <div class="flex gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-1">
          <span>👍</span>
          {{ post.likes }}
        </div>
        <div class="flex items-center gap-1">
          <span>👎</span>
          {{ post.dislikes }}
        </div>
        <div class="flex items-center gap-1">
          <span>💬</span>
          {{ post.replies }}
        </div>
        <div class="flex items-center gap-1">
          <span>🔗</span>
          <Button variant="link" size="sm" @click="handleViewPost">
            {{ post.hash.substring(0, 8) }}...
          </Button>
        </div>
      </div>
    </CardHeader>
    
    <CardContent class="pt-0">
      <div class="flex gap-2 flex-wrap">
        <Button 
          variant="default"
          size="sm"
          @click="handleLike"
          :disabled="loading"
          class="bg-green-500 hover:bg-green-600"
        >
          👍 Like
        </Button>
        <Button 
          variant="destructive"
          size="sm"
          @click="handleDislike"
          :disabled="loading"
        >
          👎 Dislike
        </Button>
        <Button 
          variant="secondary"
          size="sm"
          @click="handleReply"
          class="bg-orange-500 hover:bg-orange-600"
        >
          💬 Reply
        </Button>
        <Button 
          variant="outline"
          size="sm"
          @click="handleViewAuthor"
          class="bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
        >
          👤 Author
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

