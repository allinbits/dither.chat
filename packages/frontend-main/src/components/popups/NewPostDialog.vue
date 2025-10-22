<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import
{ Button }
  from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';

import { Textarea } from '@/components/ui/textarea';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useCreatePost } from '@/composables/useCreatePost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const MAX_CHARS = 512 - 'dither.Post("")'.length;
const message = ref('');
const isBalanceInputValid = ref(false);

const { createPost, txError, txSuccess } = useCreatePost();
const { showConfirmDialog } = useConfirmDialog();

const { isShown, inputPhotonModel, handleClose } = useTxDialog<object>('newPost', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

const canSubmit = computed(() => {
  return isBalanceInputValid.value && message.value.length > 0;
});

function handleCloseWithSaveDraft() {
  handleClose();

  if (!message.value.length) {
    return;
  }

  showConfirmDialog({
    title: 'Save to draft ?',
    description: 'Your post will be saved to draft and you can continue editing it later.',
    onCancel: () => {
      message.value = '';
    },
  });
}

async function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  const msgValue = message.value;
  message.value = '';
  handleClose();

  const toastId = showBroadcastingToast('Post');

  try {
    await createPost({
      message: msgValue,
      amountAtomics: amountAtomics.value,
    });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleCloseWithSaveDraft">
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <Textarea v-model="message" :placeholder="$t('placeholders.post')" :maxlength="MAX_CHARS" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4">
          <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
          <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
