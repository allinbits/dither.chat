<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';

import ToastWrapper from './ToastWrapper.vue';

defineProps<{
    close: () => void;
    txLabel: string;
    errorMessage: string;
}>();

const { t } = useI18n();
</script>

<template>
  <ToastWrapper :close="close" class="min-w-[230px]">
    <div class="size-6">
      <X class="text-red-500" />
    </div>
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100 !transition-[color]">
        {{ t('components.Toast.fail', { txLabel: txLabel }) }}
      </div>
      <div class="text-sm text-gray-700 dark:text-gray-300 mt-1 !transition-[color]">
        {{ errorMessage }}
      </div>
    </div>
  </ToastWrapper>
</template>
