<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { usePopups } from '@/composables/usePopups';
import { useTxNotification } from '@/composables/useTxNotification';
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
const balanceFetcher = useBalanceFetcher();

const photonValue = ref(1);
const txError = ref<string>();
const txSuccess = ref<string>();
const isBalanceInputValid = ref(false);

const isShown = computed(() => !!popups.state.dislike);
useTxNotification(isShown, 'Dislike', txSuccess, txError);

async function handleSubmit() {
    if (!popups.state.dislike) {
        return;
    }

    const result = await wallet.dither.dislike(popups.state.dislike.hash, BigInt(photonValue.value).toString());

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

const isProcessing = computed(() => {
    return wallet.processState.value !== 'idle';
});

const isBroadcasting = computed(() => {
    return wallet.processState.value === 'broadcasting';
});

function handleClose() {
    popups.state.dislike = null;
    txError.value = undefined;
    txSuccess.value = undefined;
    photonValue.value = 1;
}

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

watch(wallet.loggedIn, async () => {
    if (!wallet.loggedIn.value) {
        return;
    }

    balanceFetcher.updateAddress(wallet.address.value);
});
</script>

<template>
  <Dialog :open="popups.state.dislike != null && !isBroadcasting" @update:open="handleClose" v-if="popups.state.dislike && !isBroadcasting">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.dislikePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(popups.state.dislike.hash) }}</DialogDescription>

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
