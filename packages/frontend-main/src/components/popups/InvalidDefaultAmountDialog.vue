<script lang="ts" setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { routesNames } from '@/router';

const router = useRouter();
const { isShown, handleClose } = useTxDialog<string>('invalidDefaultAmount',
    ref(undefined), ref(undefined),
);

function onClickDefaultAmountButton() {
    router.push({ name: routesNames.settingsDefaultAmount });
    handleClose();
}
</script>

<template>
  <Dialog :open="isShown" @update:open="handleClose" v-if="isShown">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.invalidDefaultAmount') }}</DialogTitle>
      <DialogDescription class="whitespace-pre-line">{{ $t('components.PopupDescriptions.invalidDefaultAmount') }}</DialogDescription>

      <Button class="w-full" @click="onClickDefaultAmountButton">
        {{ $t('components.Button.adjustDefaultAmount') }}
      </Button>
    </DialogContent>
  </Dialog>
</template>
