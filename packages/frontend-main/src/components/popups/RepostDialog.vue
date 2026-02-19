<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';
import { useRepostPost } from '@/composables/useRepostPost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);
const { repostPost, txError, txSuccess } = useRepostPost();
const { isShown, inputPhotonModel, handleClose, popupState: repost } = useTxDialog<Post>('repost', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);

const canSubmit = computed(() => {
  return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

async function handleSubmit() {
  if (!canSubmit.value || !repost.value) {
    return;
  }
  const post = ref(repost.value);
  handleClose();
  const toastId = showBroadcastingToast('Repost');
  try {
    await repostPost({ post, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.repostPost') }}</DialogTitle>
      <DialogDescription>{{ shorten(repost.hash) }}</DialogDescription>

      <!-- Original Post Display -->
      <div class="flex flex-row gap-3 border-b pb-3">
        <UserAvatar :user-address="repost.author" />
        <div class="flex flex-col w-full gap-3">
          <div class="flex flex-row gap-3 pt-2.5">
            <Username :user-address="repost.author" />
            <PrettyTimestamp :timestamp="new Date(repost.timestamp)" />
          </div>
          <!-- clamp content width to prevent overflow. 6rem accounts for the left offset -->
          <div class="max-w-[calc(min(512px,100dvw)-6rem)]">
            <PostMessage :message="repost.message" />
          </div>
        </div>
      </div>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton
          v-if="!configStore.config.defaultAmountEnabled"
          v-model="inputPhotonModel"
          @on-validity-change="handleInputValidity"
        />
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
