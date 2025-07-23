<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Decimal } from '@cosmjs/math';

import { useFlagPost } from '@/composables/useFlagPost';
import { useTxDialog } from '@/composables/useTxDialog';

import PostMessage from '../posts/PostMessage.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);
const { flagPost, txError, txSuccess } = useFlagPost();

const { isShown, inputPhotonModel, popupState: flag, handleClose } = useTxDialog<Post>('flag', 'Flag', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbit() {
    if (!canSubmit.value || !flag.value) {
        return;
    }

    const post = ref(flag.value);
    handleClose();
    const toastId = showBroadcastingToast('Flag');

    try {
        await flagPost({ post, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    }
    finally {
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
        <UserAvatar :userAddress="flag.author" />
        <div class="flex flex-col w-full gap-3">
          <div class="flex flex-row gap-3 pt-2.5">
            <Username :userAddress="flag.author" />
            <PrettyTimestamp :timestamp="new Date(flag.timestamp)" />
          </div>
          <PostMessage :message="flag.message" />
        </div>
      </div>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
