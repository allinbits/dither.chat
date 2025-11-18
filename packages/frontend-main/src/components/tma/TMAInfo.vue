<script setup lang="ts">
import { ChevronDown, ChevronRight, Globe, Smartphone } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { useTMAStore } from '@/stores/useTMAStore';

import TelegramLogo from './telegram-logo.svg';

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
    isInitialized: tmaStore.isInitialized,
    hasError: !!tmaStore.error,
    error: tmaStore.error,
  };
});

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div v-if="tmaInfo.isInitialized" class="border-y md:border-x md:rounded-lg bg-background">
    <!-- Summary -->
    <Button
      variant="ghost"
      class="w-full flex items-center justify-between p-4 text-left h-auto"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <TelegramLogo class="size-4" />
          <span class="font-medium">{{ tmaInfo.userName }}</span>
        </div>
        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          <Smartphone class="size-3" />
          <span>{{ tmaInfo.platform }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div
          v-if="tmaInfo.hasError"
          class="w-2 h-2 bg-destructive rounded-full"
          title="Error detected"
        />
        <ChevronDown
          v-if="isExpanded"
          class="size-4 text-muted-foreground transition-transform"
        />
        <ChevronRight
          v-else
          class="size-4 text-muted-foreground transition-transform"
        />
      </div>
    </Button>

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
            <Smartphone class="size-3" />
            {{ tmaInfo.platform }}
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted-foreground">Version:</span>
          <span class="flex items-center gap-1">
            <Globe class="size-3" />
            {{ tmaInfo.version }}
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted-foreground">Status:</span>
          <span
            :class="{
              'text-green-600': tmaInfo.isInitialized && !tmaInfo.hasError,
              'text-destructive': tmaInfo.hasError,
              'text-muted-foreground': !tmaInfo.isInitialized,
            }"
          >
            {{ tmaInfo.hasError ? 'Error' : 'Connected' }}
          </span>
        </div>

        <div v-if="tmaInfo.hasError" class="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
          <div class="font-medium text-destructive mb-1">
            Error Details:
          </div>
          <div class="font-mono">
            {{ tmaInfo.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
