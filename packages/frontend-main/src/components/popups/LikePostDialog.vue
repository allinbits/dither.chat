<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Decimal } from '@cosmjs/math';

import { useLikePost } from '@/composables/useLikePost';
import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';
import { shorten } from '@/utility/text';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);
const { likePost, txError, txSuccess } = useLikePost();
const { isShown, inputPhotonModel, handleClose, popupState: like } = useTxDialog<Post>('like', 'Like', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbmit() {
    if (!canSubmit.value || !like.value) {
        return;
    }

    const post = ref(like.value);
    handleClose();
    const toastId = showBroadcastingToast('Like');

    try {
        await likePost({ post, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    }
    finally {
        toast.dismiss(toastId);
    }
}
</script>

<template>
  <Dialog :open="isShown" @update:open="handleClose" v-if="isShown">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.likePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(like.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton
          v-model="inputPhotonModel"
          @on-validity-change="handleInputValidity"
        />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
