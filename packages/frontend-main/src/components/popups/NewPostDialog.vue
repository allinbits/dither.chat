<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PostEditorToolbar from '@/components/posts/PostEditorToolbar.vue';
import PostMediaThumbnail from '@/components/posts/PostMediaThumbnail.vue';
import
{ Button }
  from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  ResponsiveDialogContent,
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

function handleInsertText(text: string) {
  // Ensure there's a space before inserting new text
  if (message.value.length > 0 && !message.value.endsWith(' ')) {
    message.value += ' ';
  }

  message.value += text;
}

function handleRemoveText(text: string) {
  message.value = message.value.replace(text, '').trim();
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleCloseWithSaveDraft">
      <ResponsiveDialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <Textarea
          v-model="message" :placeholder="$t('placeholders.post')" :maxlength="MAX_CHARS" class="min-h-[74px] w-full break-all"
        />

        <PostMediaThumbnail :content="message" @remove-text="handleRemoveText" />

        <PostEditorToolbar :content="message" @insert-text="handleInsertText" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4">
          <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
          <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </Dialog>
  </div>
</template>
