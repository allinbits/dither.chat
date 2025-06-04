<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useFlagPost } from '@/composables/useFlagPost';
import { usePopups } from '@/composables/usePopups';
import { useTxNotification } from '@/composables/useTxNotification';
import { useWallet } from '@/composables/useWallet';

import PostMessage from '../posts/PostMessage.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import { Button }
    from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
const popups = usePopups();
const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();
const photonValue = ref(1);
const isBalanceInputValid = ref(false);
const { flagPost, txError, txSuccess } = useFlagPost();

const isShown = computed(() => !!popups.state.flag);
useTxNotification(isShown, 'Flag', txSuccess, txError);

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
    popups.state.flag = null;
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
async function handleSumbit() {
    if (!canSubmit.value || !popups.state.flag) {
        return;
    }
    await flagPost({ postHash: popups.state.flag.hash, photonValue: photonValue.value });
    handleClose();
}
</script>

<template>
  <Dialog :open="popups.state.flag != null && !isBroadcasting" @update:open="handleClose" v-if="popups.state.flag && !isBroadcasting">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.flagPost') }}</DialogTitle>

      <div v-if="!isProcessing && !txSuccess" class="flex flex-row gap-3 border-b pb-3">
        <UserAvatar :userAddress="popups.state.flag.author" />
        <div class="flex flex-col w-full gap-3">
          <div class="flex flex-row gap-3 pt-2.5">
            <Username :userAddress="popups.state.flag.author" />
            <PrettyTimestamp :timestamp="new Date(popups.state.flag.timestamp)" />
          </div>
          <PostMessage :post="popups.state.flag" />
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
      <!-- Success Status -->
      <div class="flex flex-col w-full gap-4 overflow-hidden" v-if="!isProcessing && txSuccess">
        <span>{{ $t('components.Wallet.broadcastSuccess') }}</span>
        <span class="flex lowercase overflow-x-scroll py-2">{{ txSuccess }}</span>
        <Button class="w-full" @click="handleClose">
          {{ $t('components.Button.close') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
