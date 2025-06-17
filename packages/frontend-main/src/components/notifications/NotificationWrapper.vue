<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import { Check } from 'lucide-vue-next';

import { useReadNotification } from '@/composables/useReadNotification';

import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import NotificationType from './NotificationType.vue';

import Button from '@/components/ui/button/Button.vue';

const { readNotification } = useReadNotification();

defineProps<{ notification: Notification }>();

</script>

<template>
  <RouterLink :to="`/post/${notification.hash}`" custom v-slot="{ navigate }">
    <div class="flex flex-row gap-3 border-b cursor-pointer p-4" @click="navigate">
      <RouterLink :to="`/profile/${notification.actor}`">
        <UserAvatar :userAddress="notification.actor" />
      </RouterLink>

      <div class="flex flex-col w-full gap-1" >
        <div class="flex flex-row justify-between items-center h-[40px]">
          <div class="flex flex-row gap-3">
            <RouterLink :to="`/profile/${notification.actor}`">
              <Username :userAddress="notification.actor" />
            </RouterLink>
            <PrettyTimestamp v-if="notification.timestamp" :timestamp="new Date(notification.timestamp)" />
          </div>
          <Button variant="outline" class="flex flex-col items-center justify-center size-10" v-if="!notification.was_read" custom @click.stop @click="readNotification({notification})">
            <Check class="size-5"/>
          </Button>
        </div>

        <div class="flex flex-col gap-2">
          <NotificationType :notification="notification"/>
          <slot/>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
