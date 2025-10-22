<script lang="ts" setup>
import type { Notification } from 'api-main/types/notifications';

import { Flag, MessageCircle, ThumbsDown, ThumbsUp, UserPlus } from 'lucide-vue-next';

import { cn } from '@/utility';

defineProps<{ notification: Notification }>();
</script>

<template>
  <div class="flex flex-row items-center gap-3 ">
    <div class="flex items-center justify-center">
      <component
        :is="notification.type === 'like' ? ThumbsUp
          : notification.type === 'dislike' ? ThumbsDown
            : notification.type === 'follow' ? UserPlus
              : notification.type === 'flag' ? Flag
                : notification.type === 'reply' ? MessageCircle : null"
        :class="cn('size-5', notification.type === 'dislike' && 'scale-x-[-1]')"
      />
    </div>
    <span class="leading-6 text-md font-semibold">{{ $t(`components.Notifications.${notification.type}`) }}</span>
  </div>
</template>
