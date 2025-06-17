<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useLikePost } from '@/composables/useLikePost';
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
const isBalanceInputValid = ref(false);
const { likePost, txError, txSuccess } = useLikePost();
const isShown = computed(() => !!popups.state.like);
useTxNotification(isShown, 'Like', txSuccess, txError);

const isProcessing = computed(() => {
    return wallet.processState.value !== 'idle';
});
const isBroadcasting = computed(() => {
    return wallet.processState.value === 'broadcasting';
});
const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleClose() {
    popups.state.like = null;
    txError.value = undefined;
    txSuccess.value = undefined;
    photonValue.value = 1;
}

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

watch([wallet.loggedIn, wallet.address], async () => {
    if (!wallet.loggedIn.value) {
        return;
    }

    balanceFetcher.updateAddress(wallet.address.value);
});

async function handleSumbmit() {
    if (!canSubmit.value || !popups.state.like) {
        return;
    }
    await likePost({ post: ref(popups.state.like), photonValue: photonValue.value });
    handleClose();
}
</script>

<template>
  <Dialog :open="!!popups.state.like && !isBroadcasting" @update:open="handleClose" v-if="popups.state.like && !isBroadcasting">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.likePost') }}</DialogTitle>
      <DialogDescription>{{ shorten(popups.state.like.hash) }}</DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
        <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
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
