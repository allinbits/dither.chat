<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { Loader } from 'lucide-vue-next';

import { useDislikePost } from '@/composables/useDislikePost';
import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';
import { shorten } from '@/utility/text';

const isBalanceInputValid = ref(false);
const { dislikePost, txError, txSuccess } = useDislikePost();

const { isProcessing, isShown, inputPhotonModel, handleClose, popupState: dislike } = useTxDialog<Post>('dislike', 'Dislike', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbmit() {
    if (!canSubmit.value || !dislike.value) {
        return;
    }
    await dislikePost({ post: ref(dislike.value), amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    handleClose();
}
</script>

<template>
  <Dialog :open="isShown" @update:open="handleClose" v-if="isShown">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.dislikePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(dislike.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
        <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
      <!-- Broadcast Status -->
      <div class="flex flex-col w-full gap-4" v-if="isProcessing && !txSuccess">
        {{  $t('components.Wallet.popupSign') }}
        <Loader class="animate-spin w-full"/>
      </div>
    </DialogContent>
  </Dialog>
</template>
