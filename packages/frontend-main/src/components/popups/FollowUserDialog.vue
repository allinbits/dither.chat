<script lang="ts" setup>
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Decimal } from '@cosmjs/math';

import { useFollowUser } from '@/composables/useFollowUser';
import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);
const { followUser,
    txError,
    txSuccess } = useFollowUser();

const {
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

    const userAddress = ref(follow.value);
    handleClose();
    const toastId = showBroadcastingToast('Follow');

    try {
        await followUser({ userAddress, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    }
    finally {
        toast.dismiss(toastId);
    }
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
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
