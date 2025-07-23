<script lang="ts" setup>
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Decimal } from '@cosmjs/math';

import { useTipUser } from '@/composables/useTipUser';
import { useTxDialog } from '@/composables/useTxDialog';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);

const { tipUser, txError, txSuccess } = useTipUser();
const {
    isShown,
    inputPhotonModel,
    popupState: tip,
    handleClose,
} = useTxDialog<string>('tipUser', 'Tip', txSuccess, txError);

const canSubmit = computed(() => {
    return isBalanceInputValid.value;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

async function handleSumbit() {
    if (!canSubmit.value || !tip.value) {
        return;
    }

    const userAddress = ref(tip.value);
    handleClose();
    const toastId = showBroadcastingToast('Tip');

    try {
        await tipUser({ userAddress, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    }
    finally {
        toast.dismiss(toastId);
    }
}

</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <DialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.tipUser') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :userAddress="tip"/>
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSumbit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
