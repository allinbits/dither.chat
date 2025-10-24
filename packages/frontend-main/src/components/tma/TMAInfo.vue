<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ChevronDown, ChevronRight, Globe, Smartphone, User } from 'lucide-vue-next';

import { useTMAStore } from '@/stores/useTMAStore';

const tmaStore = useTMAStore();
const isExpanded = ref(false);

onMounted(async () => {
    if (!tmaStore.isInitialized) {
        await tmaStore.initialize();
    }
});

const tmaInfo = computed(() => {
    const params = tmaStore.launchParams;
    const initData = tmaStore.initData;
    const user = initData?.user;

    return {
        userName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Unknown User',
        userId: user?.id?.toString() || 'Unknown',
        platform: params?.tgWebAppPlatform || 'Unknown',
        version: params?.tgWebAppVersion || 'Unknown',
        isAvailable: tmaStore.isAvailable,
        isInitialized: tmaStore.isInitialized,
        hasError: !!tmaStore.error,
        error: tmaStore.error,
    };
});

const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="border rounded-lg bg-background" v-if="tmaInfo.isInitialized">
    <!-- Summary -->
    <button
      @click="toggleExpanded"
      class="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <User class="w-4 h-4 text-muted-foreground" />
          <span class="font-medium">{{ tmaInfo.userName }}</span>
        </div>
        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          <Smartphone class="w-3 h-3" />
          <span>{{ tmaInfo.platform }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div
          v-if="tmaInfo.hasError"
          class="w-2 h-2 bg-destructive rounded-full"
          title="Error detected"
        />
        <div
          v-else-if="tmaInfo.isAvailable"
          class="w-2 h-2 bg-green-500 rounded-full"
          title="Telegram WebApp available"
        />
        <div
          v-else
          class="w-2 h-2 bg-muted-foreground rounded-full"
          title="Telegram WebApp not available"
        />
        <ChevronDown
          v-if="isExpanded"
          class="w-4 h-4 text-muted-foreground transition-transform"
        />
        <ChevronRight
          v-else
          class="w-4 h-4 text-muted-foreground transition-transform"
        />
      </div>
    </button>

    <!-- Details -->
    <div
      v-if="isExpanded"
      class="border-t bg-muted/30 p-4 space-y-3"
    >
      <div class="grid grid-cols-1 gap-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">User ID:</span>
          <span class="font-mono text-xs">{{ tmaInfo.userId }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted-foreground">Platform:</span>
          <span class="flex items-center gap-1">
            <Smartphone class="w-3 h-3" />
            {{ tmaInfo.platform }}
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted-foreground">Version:</span>
          <span class="flex items-center gap-1">
            <Globe class="w-3 h-3" />
            {{ tmaInfo.version }}
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted-foreground">Status:</span>
          <span
            :class="{
              'text-green-600': tmaInfo.isAvailable && !tmaInfo.hasError,
              'text-destructive': tmaInfo.hasError,
              'text-muted-foreground': !tmaInfo.isAvailable
            }"
          >
            {{ tmaInfo.hasError ? 'Error' : tmaInfo.isAvailable ? 'Connected' : 'Not Available' }}
          </span>
        </div>

        <div v-if="tmaInfo.hasError" class="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
          <div class="font-medium text-destructive mb-1">Error Details:</div>
          <div class="font-mono">{{ tmaInfo.error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
