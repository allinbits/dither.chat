<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { useDislikePost } from '@/composables/useDislikePost';
import { useFractionalDigits } from '@/composables/useFractionalDigits';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

const isBalanceInputValid = ref(false);
const { dislikePost, txError, txSuccess } = useDislikePost();
const { isShown, inputPhotonModel, handleClose, popupState: dislike } = useTxDialog<Post>('dislike', txSuccess, txError);
const configStore = useConfigStore();
const fractionalDigits = useFractionalDigits();
const amountAtomics = computed(() =>
  configStore.config.defaultAmountEnabled
    ? configStore.config.defaultAmountAtomics
    : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics,
);

const canSubmit = computed(() => isBalanceInputValid.value);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

async function handleSubmit() {
  if (!canSubmit.value || !dislike.value) {
    return;
  }

  const post = ref(dislike.value);
  handleClose();
  const toastId = showBroadcastingToast('Dislike');

  try {
    await dislikePost({ post, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.dislikePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(dislike.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
