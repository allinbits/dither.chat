<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useFollowUser } from '@/composables/useFollowUser';
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
const isBalanceInputValid = ref(false);
const { followUser,
    txError,
    txSuccess } = useFollowUser();
const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});
const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleClose() {
    popups.state.follow = null;
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
    if (!canSubmit.value || !popups.state.follow) {
        return;
    }
    await followUser({ userAddress: ref(popups.state.follow), photonValue: photonValue.value });
}

</script>

<template>
  <Dialog :open="popups.state.follow != null" @update:open="handleClose" v-if="popups.state.follow" :scrollable="false">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.follow') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :userAddress="popups.state.follow"/>
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isBroadcasting && !txSuccess">
        <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
      <!-- Broadcast Status -->
      <div class="flex flex-col w-full gap-4" v-if="isBroadcasting && !txSuccess">
        {{  $t('components.Wallet.popupSign') }}
        <Loader class="animate-spin w-full"/>
      </div>
      <!-- Success Status -->
      <div class="flex flex-col w-full gap-4 overflow-hidden" v-if="!isBroadcasting && txSuccess">
        <span>{{ $t('components.Wallet.broadcastSuccess') }}</span>
        <span class="flex lowercase overflow-x-scroll py-2">{{ txSuccess }}</span>
        <Button class="w-full" @click="handleClose">
          {{ $t('components.Button.close') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
