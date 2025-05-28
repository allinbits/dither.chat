<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import PostMessage from '../posts/PostMessage.vue';

import NotificationWrapper from './NotificationWrapper.vue';

defineProps<{ notification: Notification }>();

</script>

<template>
  <NotificationWrapper :notification="notification">
    <PostMessage class="line-clamp-3" :message="'post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message post.message '" />
  </NotificationWrapper>
</template>
