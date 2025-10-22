<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import { Check } from 'lucide-vue-next';
import { computed } from 'vue';

import Button from '@/components/ui/button/Button.vue';
import { useReadNotification } from '@/composables/useReadNotification';

import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';
import NotificationType from './NotificationType.vue';

const props = defineProps<{ notification: Notification }>();

const { readNotification } = useReadNotification();

const navigationPath = computed(() => {
  const notification = props.notification;

  // actions on post
  if (['like', 'dislike', 'flag'].includes(notification.type)) {
    return `/post/${notification.post_hash}`;
  }

  // actions on user
  if (['follow'].includes(notification.type)) {
    return `/profile/${notification.actor}`;
  }

  // reply
  if (['reply'].includes(notification.type)) {
    return `/post/${notification.hash}`;
  }

  return '/';
});
</script>

<template>
  <RouterLink v-slot="{ navigate }" :to="navigationPath" custom>
    <div class="flex flex-row gap-3 border-b cursor-pointer p-4" @click="navigate">
      <RouterLink :to="`/profile/${notification.actor}`">
        <UserAvatar :user-address="notification.actor" />
      </RouterLink>

      <div class="flex flex-col w-full gap-1">
        <div class="flex flex-row justify-between items-center h-[40px]">
          <div class="flex flex-row gap-3">
            <RouterLink :to="`/profile/${notification.actor}`">
              <Username :user-address="notification.actor" />
            </RouterLink>
            <PrettyTimestamp v-if="notification.timestamp" :timestamp="new Date(notification.timestamp)" />
          </div>
          <Button v-if="!notification.was_read" variant="outline" class="flex flex-col items-center justify-center size-10" custom @click.stop @click="readNotification({ notification })">
            <Check class="size-5" />
          </Button>
        </div>

        <div class="flex flex-col gap-2">
          <NotificationType :notification="notification" />
          <slot />
        </div>
      </div>
    </div>
  </RouterLink>
</template>
