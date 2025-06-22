<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useChain } from '@/composables/useChain';
import { useFlagPost } from '@/composables/useFlagPost';
import { useTxDialog } from '@/composables/useTxDialog';

import PostMessage from '../posts/PostMessage.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';

const isBalanceInputValid = ref(false);
const { flagPost, txError, txSuccess } = useFlagPost();

const {
    isProcessing,
    isShown, photonValue, popupState: flag, handleClose } = useTxDialog<Post>('flag', 'Flag', txSuccess, txError);
const { getAtomicCurrencyAmount } = useChain();

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
    await flagPost({ post: ref(flag.value), atomicPhotonValue: getAtomicCurrencyAmount('PHOTON', photonValue.value) });
    handleClose();
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.flagPost') }}</DialogTitle>
      <span>{{ $t('components.PopupDescriptions.flagPost') }}</span>
      <div v-if="!isProcessing && !txSuccess" class="flex flex-row gap-3 border-b pb-3">
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
      <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
        <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
      <!-- Broadcast Status -->
      <div class="flex flex-col w-full gap-4" v-if="isProcessing && !txSuccess">
        {{ $t('components.Wallet.popupSign') }}
        <Loader class="animate-spin w-full" />
      </div>
    </DialogContent>
  </Dialog>
</template>
