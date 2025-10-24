<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useTMAStore } from '@/stores/useTMAStore';

const tmaStore = useTMAStore();

onMounted(async () => {
    if (!tmaStore.isInitialized) {
        await tmaStore.initialize();
    }
});

const debugInfo = computed(() => {
    const params = tmaStore.launchParams;
    const initData = tmaStore.initData;

    return {
        user: initData?.user ?? 'unknown',
        error: tmaStore.error ?? 'none',
        platform: params?.tgWebAppPlatform ?? 'unknown',
        version: params?.tgWebAppVersion ?? 'unknown',
        isAvailable: tmaStore.isAvailable,
        isInitialized: tmaStore.isInitialized,
        hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
        hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
        logs: tmaStore.debugLogs,
    };
});
</script>

<template>
  <div class="text-xs p-2 bg-secondary rounded-md">
    <h3 class="text-sm font-semibold mb-2">Telegram Debug Info</h3>
    <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
  </div>
</template>
