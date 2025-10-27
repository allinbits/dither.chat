import type { InitData, RetrieveLaunchParamsResult } from '@tma.js/sdk-vue';

import {
  initData,

  init as initSDK,
  retrieveLaunchParams,

  setDebug,
  useSignal,
} from '@tma.js/sdk-vue';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// Extend Window interface to include Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: unknown;
    };
  }
}

export const useTMAStore = defineStore('tmaStore', () => {
  const isInitialized = ref(false);
  const launchParams = ref<RetrieveLaunchParamsResult | null>(null);
  const initDataRef = ref<InitData | undefined>(undefined);
  const error = ref<string | null>(null);
  const debugLogs = ref<string[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      setDebug(true);
      initSDK();

      // Mount components first
      initData.restore();

      // Then retrieve data
      const params = retrieveLaunchParams();
      launchParams.value = params;

      // Get init data using the signal
      const initDataSignal = useSignal(initData.state);
      initDataRef.value = initDataSignal.value;

      isInitialized.value = true;
      error.value = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      debugLogs.value.push(errorMessage);
      error.value = errorMessage;
    }
  };

  const reset = () => {
    isInitialized.value = false;
    launchParams.value = null;
    error.value = null;
    debugLogs.value = [];
  };

  return {
    isAvailable: computed(
      () => typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp),
    ),
    isInitialized,
    launchParams,
    initData: initDataRef,
    error,
    debugLogs,
    initialize,
    reset,
  };
});
