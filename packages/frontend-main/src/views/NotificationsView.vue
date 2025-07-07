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
import { cn } from '@/utility';

const wallet = useWallet();

const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = useNotifications({ userAddress: wallet.address });
// const flatNotifications = computed(() => data.value?.pages.flat() ?? []);

const flatNotifications = [{
    hash: 'b1faa15fad9d3ad1058c0a7f72613fe95735cbe696965b65be91aaaf032a7ae9',
    owner: 'atone14n7v36p24sckmdrwpr83pad35dcjm636sz9tt81',
    actor: 'atone14n7v36p24sckmdrwpr83pad35dcjm636sz9tt8',
    type: 'like',
    subcontext: '1',
    timestamp: new Date(),
    was_read: false,
}];

</script>

<template>
  <MainLayout>
    <div class="mt-6 flex flex-col">
      <h1 class="hidden xl:inline text-lg font-semibold mb-4 ml-7">
        {{ $t('components.Titles.notifications') }}
      </h1>

      <div :class="cn('flex flex-col w-full', flatNotifications.length && 'border-t')">
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
                  variant="outline">
            {{ $t('components.Button.showMore') }}
          </Button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>
