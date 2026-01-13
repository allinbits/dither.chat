<script lang="ts" setup>
import { ref } from 'vue';
import { toast } from 'vue-sonner';

import PostComposer from '@/components/posts/PostComposer.vue';
import {
  Dialog,
  DialogTitle,
  ResponsiveDialogContent,
} from '@/components/ui/dialog';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useCreatePost } from '@/composables/useCreatePost';
import { useTxDialog } from '@/composables/useTxDialog';
import { showBroadcastingToast } from '@/utility/toast';

const MAX_CHARS = 512 - 'dither.Post("")'.length;
const message = ref('');

const { createPost, txError, txSuccess } = useCreatePost();
const { showConfirmDialog } = useConfirmDialog();

const { isShown, handleClose } = useTxDialog<object>('newPost', txSuccess, txError);

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

async function handleSubmit({ message: msgValue, amountAtomics }: { message: string; amountAtomics: string }) {
  message.value = '';
  handleClose();

  const toastId = showBroadcastingToast('Post');

  try {
    await createPost({
      message: msgValue,
      amountAtomics,
    });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleCloseWithSaveDraft">
      <ResponsiveDialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <PostComposer
          v-model="message"
          :max-chars="MAX_CHARS"
          :placeholder="$t('placeholders.post')"
          @submit="handleSubmit"
        />
      </ResponsiveDialogContent>
    </Dialog>
  </div>
</template>
