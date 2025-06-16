<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import { Check } from 'lucide-vue-next';

import { useNotifications } from '@/composables/useNotifications';
import { useWallet } from '@/composables/useWallet';

import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import NotificationType from './NotificationType.vue';

import Button from '@/components/ui/button/Button.vue';

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000';
const { address } = useWallet();
const { refetch } = useNotifications({ userAddress: address });

const props = defineProps<{ notification: Notification }>();

const readNotification = async () => {
    const resVerifyRaw = await fetch(apiRoot + `/notification-read?hash=${props.notification.hash}&address=${address.value}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (resVerifyRaw.status !== 200) {
        return;
    }

    const resVerify = await resVerifyRaw.json();
    if (resVerify.status !== 200) {
        return;
    }

    refetch();
};
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
          <Button variant="outline" class="flex flex-col items-center justify-center size-10" v-if="!notification.was_read" custom @click.stop @click="readNotification">
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
