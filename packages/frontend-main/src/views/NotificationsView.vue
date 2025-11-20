<script setup lang="ts">
import { Bell, Loader } from 'lucide-vue-next';
import { computed } from 'vue';

import DislikeNotification from '@/components/notifications/DislikeNotification.vue';
import FlagNotification from '@/components/notifications/FlagNotification.vue';
import FollowNotification from '@/components/notifications/FollowNotification.vue';
import LikeNotification from '@/components/notifications/LikeNotification.vue';
import ReplyNotification from '@/components/notifications/ReplyNotification.vue';
import Button from '@/components/ui/button/Button.vue';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useNotifications } from '@/composables/useNotifications';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { cn } from '@/utility';

import ViewHeading from './ViewHeading.vue';

const wallet = useWallet();

const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useNotifications({ userAddress: wallet.address });
const flatNotifications = computed(() => data.value?.pages.flat() ?? []);
</script>

<template>
  <MainLayout>
    <div class="flex flex-col flex-1">
      <ViewHeading :title="$t('components.Headings.notifications')" />

      <div :class="cn('flex flex-col flex-1')">
        <Loader v-if="isLoading" class="animate-spin m-auto" />
        <Empty v-else-if="!flatNotifications.length">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bell class="size-6" />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>
            {{ $t('components.Notifications.empty') }}
          </EmptyTitle>
        </Empty>

        <template v-for="(notification, index) in flatNotifications">
          <LikeNotification v-if="notification.type === 'like'" :key="index" :notification="notification" />
          <DislikeNotification v-if="notification.type === 'dislike'" :key="index" :notification="notification" />
          <FollowNotification v-if="notification.type === 'follow'" :key="index" :notification="notification" />
          <FlagNotification v-if="notification.type === 'flag'" :key="index" :notification="notification" />
          <ReplyNotification v-if="notification.type === 'reply'" :key="index" :notification="notification" />
        </template>

        <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
          <Loader v-if="isFetchingNextPage" class="animate-spin " />
          <Button
            v-if="hasNextPage && !isFetchingNextPage" size="sm" class="w-full text-sm" variant="outline"
            @click="fetchNextPage"
          >
            {{ $t('components.Button.showMore') }}
          </Button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
