<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import PostMessage from '../posts/PostMessage.vue';

import NotificationWrapper from './NotificationWrapper.vue';

defineProps<{ notification: Notification }>();

</script>

<template>
  <NotificationWrapper :notification="notification">
    <PostMessage v-if="notification.subcontext" class="line-clamp-2" :message="notification.subcontext" />
  </NotificationWrapper>
</template>
