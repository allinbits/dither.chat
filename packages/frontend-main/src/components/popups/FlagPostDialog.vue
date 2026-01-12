<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PromoteToggle from '@/components/posts/PromoteToggle.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import { useFlagPost } from '@/composables/useFlagPost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

import PostMessage from '../posts/PostMessage.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

const { flagPost, txError, txSuccess } = useFlagPost();
const {
  isShown,
  popupState: flag,
  handleClose,
} = useTxDialog<Post>('flag', txSuccess, txError);
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
  if (!canSubmit.value || !flag.value) {
    return;
  }

  const post = ref(flag.value);
  handleClose();
  const toastId = showBroadcastingToast('Flag');

  try {
    await flagPost({ post, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.flagPost') }}</DialogTitle>
      <span>{{ $t('components.PopupDescriptions.flagPost') }}</span>
      <div class="flex flex-row gap-3 border-b pb-3">
        <UserAvatar :user-address="flag.author" />
        <div class="flex flex-col w-full gap-3">
          <div class="flex flex-row gap-3 pt-2.5">
            <Username :user-address="flag.author" />
            <PrettyTimestamp :timestamp="new Date(flag.timestamp)" />
          </div>
          <PostMessage :message="flag.message" />
        </div>
      </div>

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
