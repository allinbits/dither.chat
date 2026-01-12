<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PromoteToggle from '@/components/posts/PromoteToggle.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import { useLikePost } from '@/composables/useLikePost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

const { likePost, txError, txSuccess } = useLikePost();
const { isShown, handleClose, popupState: like } = useTxDialog<Post>('like', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => {
  if (configStore.config.defaultAmountEnabled) {
    return configStore.config.defaultAmountAtomics;
  }

  return configStore.config.regularSendAmountAtomics;
});

// TODO: Verify wallet has enough balance for amountAtomics before allowing submit
const canSubmit = computed(() => {
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value || !like.value) {
    return;
  }
  const post = ref(like.value);
  handleClose();
  const toastId = showBroadcastingToast('Like');
  try {
    await likePost({ post, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.likePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(like.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <PromoteToggle :show-promote-button="false" />
        <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
