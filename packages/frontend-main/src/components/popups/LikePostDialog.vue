<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { nextTick, ref } from 'vue';
import { Loader } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useTxDialog } from '@/composables/useTxDialog';
import { useWallet } from '@/composables/useWallet';

import DialogDescription from '../ui/dialog/DialogDescription.vue';

import
{ Button }
    from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { shorten } from '@/utility/text';

const popups = usePopups();
const wallet = useWallet();

const txError = ref<string>();
const txSuccess = ref<string>();
const isBalanceInputValid = ref(false);

const {
    isProcessing,
    isShown,
    photonValue,
    popupState: like,
    handleClose,
} = useTxDialog<Post>('like', 'Like', txSuccess, txError);

async function handleSubmit() {
    if (!popups.state.like) {
        return;
    }

    const result = await wallet.dither.like(popups.state.like.hash, BigInt(photonValue.value).toString());

    if (!result.broadcast) {
        txError.value = result.msg;
    }
    else {
        txSuccess.value = result.tx?.transactionHash;
    }

    nextTick(() => {
        handleClose();
    });
}

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.likePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(like.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
        <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="isBalanceInputValid ? handleSubmit() : () => {}">
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
