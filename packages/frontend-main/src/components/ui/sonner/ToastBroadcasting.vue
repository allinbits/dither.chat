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
  <ToastWrapper :close="close" class="min-w-[330px]">
    <div>
      <Loader class="animate-spin w-6"/>
    </div>
    <div>
      <div class="font-semibold text-sm text-gray-900 dark:text-gray-100 !transition-[color]">
        {{ t('components.Toast.broadcasting') }}
      </div>
      <div class="text-sm text-gray-700 dark:text-gray-300 mt-1 !transition-[color]">
        {{ t('components.Toast.wait') }}
      </div>
    </div>
  </ToastWrapper>
</template>
