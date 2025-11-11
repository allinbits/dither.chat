<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import { useTxDialog } from '@/composables/useTxDialog';
import { routesNames } from '@/router';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

const router = useRouter();
const { isShown, handleClose } = useTxDialog<string>('invalidDefaultAmount', ref(undefined), ref(undefined));

function onClickDefaultAmountButton() {
  router.push({ name: routesNames.settingsDefaultAmount });
  handleClose();
}
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.invalidDefaultAmount') }}</DialogTitle>
      <DialogDescription class="whitespace-pre-line">
        {{ $t('components.PopupDescriptions.invalidDefaultAmount') }}
      </DialogDescription>

      <Button class="w-full" @click="onClickDefaultAmountButton">
        {{ $t('components.Button.adjustDefaultAmount') }}
      </Button>
    </ResponsiveDialogContent>
  </Dialog>
</template>
