<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { Loader } from 'lucide-vue-next';

import { useFollowUser } from '@/composables/useFollowUser';
import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';

const isBalanceInputValid = ref(false);
const { followUser,
    txError,
    txSuccess } = useFollowUser();

const {
    isProcessing,
    isShown,
    inputPhotonModel,
    popupState: follow,
    handleClose,
} = useTxDialog<string>('follow', 'Follow', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbmit() {
    if (!canSubmit.value || !follow.value) {
        return;
    }
    await followUser({ userAddress: follow, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    handleClose();
}

</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose" :scrollable="false">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.follow') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :userAddress="follow"/>
      </DialogDescription>

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
