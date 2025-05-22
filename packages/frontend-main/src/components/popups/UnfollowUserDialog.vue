<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import
{ Button }
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
const txError = ref<string>();
const txSuccess = ref<string>();
const isBalanceInputValid = ref(false);

async function handleSubmit() {
    if (!popups.state.unfollow) {
        return;
    }

    const result = await wallet.dither.unfollow(popups.state.unfollow, BigInt(photonValue.value).toString());
    if (!result.broadcast) {
        txError.value = result.msg;
        return;
    }

    txSuccess.value = result.tx?.transactionHash;
}

const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});

function handleClose() {
    popups.state.unfollow = null;
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
  <Dialog :open="popups.state.unfollow != null" @update:open="handleClose" v-if="popups.state.unfollow">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.unfollow') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :userAddress="popups.state.unfollow"/>
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isBroadcasting && !txSuccess">
        <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full xl:inline hidden" :disabled="!isBalanceInputValid" @click="isBalanceInputValid ? handleSubmit() : () => {}">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
      <!-- Broadcast Status -->
      <div class="flex flex-col w-full gap-4" v-if="isBroadcasting && !txSuccess">
        {{  $t('components.Wallet.popupSign') }}
      </div>
      <!-- Success Status -->
      <div class="flex flex-col w-full gap-4 overflow-hidden" v-if="!isBroadcasting && txSuccess">
        <span>{{ $t('components.Wallet.broadcastSuccess') }}</span>
        <span class="flex lowercase overflow-x-scroll py-2">{{ txSuccess }}</span>
        <Button class="w-full xl:inline hidden" @click="handleClose">
          {{ $t('components.Button.close') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
