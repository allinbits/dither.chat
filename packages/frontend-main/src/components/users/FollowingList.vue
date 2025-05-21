<script setup lang="ts">
import { useFollowing } from '@/composables/useFollowing';

const props = defineProps<{ userAddress: string }>();
const { data, isLoading, isError, error } = useFollowing({
    userAddress: props.userAddress,
});

</script>

<template>
  <div class="px-4">
    <span v-if="!data.length" class="text-md font-semibold text-base">{{ $t('components.FollowingList.empty') }}</span>

    <div v-else class="flex flex-col">

      <span v-for="(item, index) in data" :key="index">{{ item.following }}</span>
      <span v-for="(item, index) in data" :key="index">{{ item.follower }}</span>
      <span v-for="(item, index) in data" :key="index">{{ item.hash }}</span>
    </div>
  </div>
</template>
