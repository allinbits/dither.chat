<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Loader } from 'lucide-vue-next';

import ToastWrapper from './ToastWrapper.vue';

const { t } = useI18n();
defineProps<{
    close: () => void;
}>();
</script>

<template>
  <ToastWrapper :close="close">
    <Loader class="animate-spin text-gray-700 dark:text-gray-200" />
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {{ t('components.Toast.broadcasting') }}
      </div>
      <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">
        {{ t('components.Toast.wait') }}
      </div>
    </div>
  </ToastWrapper>
</template>
