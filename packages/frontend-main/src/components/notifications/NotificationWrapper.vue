<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import { Check } from 'lucide-vue-next';

import { useNotifications } from '@/composables/useNotifications';
import { useWallet } from '@/composables/useWallet';

import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

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
    <div class="flex flex-row gap-3 cursor-pointer py-2 border-b">
      <RouterLink :to="`/profile/${notification.owner}`" class="size-[40px]">
        <UserAvatar :userAddress="notification.owner" />
      </RouterLink>
      <div class="flex flex-col w-full" @click="navigate">
        <div class="flex flex-row gap-3 pt-2.5">
          <RouterLink :to="`/profile/${notification.owner}`">
            <Username :userAddress="notification.owner" />
          </RouterLink>
          <PrettyTimestamp v-if="notification.timestamp" :timestamp="new Date(notification.timestamp)" />
        </div>

        <span class="leading-6 text-sm font-semibold mt-2">{{ $t(`components.Notifications.${notification.type}`) }}</span>
        <slot/>
      </div>
      <Button variant="outline" class="flex flex-col items-center justify-center w-16" v-if="!notification.was_read" @click="readNotification">
        <Check />
      </Button>
    </div>
  </RouterLink>
</template>
