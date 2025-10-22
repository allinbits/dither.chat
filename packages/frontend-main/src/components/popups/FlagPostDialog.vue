<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { useFlagPost } from '@/composables/useFlagPost';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';

import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';
import PostMessage from '../posts/PostMessage.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

const isBalanceInputValid = ref(false);
const { flagPost, txError, txSuccess } = useFlagPost();
const {
  isShown,
  inputPhotonModel,
  popupState: flag,
  handleClose,
} = useTxDialog<Post>('flag', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);

const canSubmit = computed(() => {
  return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

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
    <DialogContent>
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
        <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
