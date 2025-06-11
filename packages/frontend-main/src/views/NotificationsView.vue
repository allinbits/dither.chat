<script setup lang="ts">
import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useNotifications } from '@/composables/useNotifications';
import { useWallet } from '@/composables/useWallet';

import DislikeNotification from '@/components/notifications/DislikeNotification.vue';
import FlagNotification from '@/components/notifications/FlagNotification.vue';
import FollowNotification from '@/components/notifications/FollowNotification.vue';
import LikeNotification from '@/components/notifications/LikeNotification.vue';
import ReplyNotification from '@/components/notifications/ReplyNotification.vue';
import Button from '@/components/ui/button/Button.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const wallet = useWallet();

const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useNotifications({ userAddress: wallet.address });
const flatNotifications = computed(() => data.value?.pages.flat() ?? []);
</script>

<template>
  <MainLayout>
    <div class="mt-6 px-4 flex flex-col">
      <h1 class="hidden xl:inline text-lg font-semibold mb-4 ml-3">
        {{ $t('components.Titles.notifications') }}
      </h1>

      <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

      <span v-else-if="!flatNotifications.length" class="self-center mt-4 text-md font-semibold text-base">
        {{ $t('components.Notifications.empty') }}
      </span>

      <template v-for="(notification, index) in flatNotifications">
        <LikeNotification :key="index" v-if="notification.type === 'like'" :notification="notification"/>
        <DislikeNotification :key="index" v-if="notification.type === 'dislike'" :notification="notification"/>
        <FollowNotification :key="index" v-if="notification.type === 'follow'" :notification="notification"/>
        <FlagNotification :key="index" v-if="notification.type === 'flag'" :notification="notification"/>
        <ReplyNotification :key="index" v-if="notification.type === 'reply'" :notification="notification"/>
      </template>

      <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
        <Loader v-if="isFetchingNextPage" class="animate-spin " />
        <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
                variant="ghost">
          {{ $t('components.Button.showMore') }}
        </Button>
      </div>

    </div>
  </MainLayout>
</template>
