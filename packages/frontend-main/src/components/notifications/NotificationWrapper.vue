<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

defineProps<{ notification: Notification }>();

</script>

<template>
  <RouterLink :to="`/post/${'post.hash'}`" custom v-slot="{ navigate }">
    <div class="flex flex-row gap-3 cursor-pointer py-2">
      <RouterLink :to="`/profile/${'post.author'}`" class="size-[40px]">
        <UserAvatar :userAddress="'post.author'" />
      </RouterLink>
      <div class="flex flex-col w-full" @click="navigate">
        <div class="flex flex-row gap-3 pt-2.5">
          <RouterLink :to="`/profile/${'post.author'}`">
            <Username :userAddress="'post.author'" />
          </RouterLink>
          <PrettyTimestamp v-if="notification.timestamp" :timestamp="notification.timestamp" />
        </div>

        <span class="leading-6 text-sm font-semibold mt-2">{{ $t(`components.Notifications.${notification.type}`) }}</span>
        <slot/>
      </div>
    </div>
  </RouterLink>
</template>
