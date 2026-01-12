<script lang="ts" setup>
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PostEditorToolbar from '@/components/posts/PostEditorToolbar.vue';
import PostMediaThumbnail from '@/components/posts/PostMediaThumbnail.vue';
import PromoteToggle from '@/components/posts/PromoteToggle.vue';
import
{ Button }
  from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  ResponsiveDialogContent,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useCreatePost } from '@/composables/useCreatePost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

const MAX_CHARS = 512 - 'dither.Post("")'.length;
const message = ref('');
const isPromoted = ref(false);

const { createPost, txError, txSuccess } = useCreatePost();
const { showConfirmDialog } = useConfirmDialog();

const { isShown, handleClose } = useTxDialog<object>('newPost', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => {
  if (isPromoted.value) {
    // When promoted, use promotion amount
    return configStore.config.promotionSendAmountAtomics;
  }

  // Otherwise use default amount from settings or regular amount from env
  if (configStore.config.defaultAmountEnabled) {
    return configStore.config.defaultAmountAtomics;
  }

  return configStore.config.regularSendAmountAtomics;
});

// TODO: Verify wallet has enough balance for amountAtomics before allowing submit
const canSubmit = computed(() => {
  return message.value.length > 0;
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
          <PromoteToggle v-model="isPromoted" :show-promote-button="true" />
          <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </Dialog>
  </div>
</template>
