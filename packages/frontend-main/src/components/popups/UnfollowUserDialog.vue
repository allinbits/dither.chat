<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { Loader } from 'lucide-vue-next';

import { useTxDialog } from '@/composables/useTxDialog';
import { useUnfollowUser } from '@/composables/useUnfollowUser';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import { Button }
    from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';

const { unfollowUser, txError, txSuccess } = useUnfollowUser();

const isBalanceInputValid = ref(false);

const {
    isProcessing,
    isShown,
    inputPhotonModel,
    popupState: unfollow,
    handleClose,
} = useTxDialog<string>('unfollow', 'Unfollow', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbmit() {
    if (!canSubmit.value || !unfollow.value) {
        return;
    }
    await unfollowUser({ userAddress: unfollow, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    handleClose();
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.unfollow') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :userAddress="unfollow" />
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
        <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full xl:inline hidden" :disabled="!isBalanceInputValid" @click="handleSumbmit">
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
