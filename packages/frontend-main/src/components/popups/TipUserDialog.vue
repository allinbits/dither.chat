<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { useFractionalDigits } from '@/composables/useFractionalDigits';
import { useTipUser } from '@/composables/useTipUser';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

const isBalanceInputValid = ref(false);

const { tipUser, txError, txSuccess } = useTipUser();
const {
  isShown,
  inputPhotonModel,
  popupState: tip,
  handleClose,
} = useTxDialog<string>('tipUser', txSuccess, txError);
const configStore = useConfigStore();
const fractionalDigits = useFractionalDigits();
const amountAtomics = computed(() =>
  configStore.config.defaultAmountEnabled
    ? configStore.config.defaultAmountAtomics
    : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics,
);

const canSubmit = computed(() => isBalanceInputValid.value);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

async function handleSubmit() {
  if (!canSubmit.value || !tip.value) {
    return;
  }

  const userAddress = ref(tip.value);
  handleClose();
  const toastId = showBroadcastingToast('Tip');

  try {
    await tipUser({ userAddress, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.tipUser') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :user-address="tip" />
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
