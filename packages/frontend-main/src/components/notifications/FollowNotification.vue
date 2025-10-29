<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import NotificationWrapper from './NotificationWrapper.vue';

defineProps<{ notification: Notification }>();
</script>

<template>
  <NotificationWrapper :notification="notification" />
</template>
