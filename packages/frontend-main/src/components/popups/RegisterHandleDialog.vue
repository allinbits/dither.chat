<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { useRegisterHandle } from '@/composables/useRegisterHandle';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);

const { registerHandle, txError, txSuccess } = useRegisterHandle();
const { isShown, inputPhotonModel, handleClose, popupState: register } = useTxDialog<string>('registerHandle', txSuccess, txError);
const configStore = useConfigStore();

const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);
const canSubmit = computed(() => isBalanceInputValid.value);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

async function handleSubmit() {
  if (!canSubmit.value || !register.value) {
    return;
  }

  const handle = ref(register.value);
  handleClose();

  const toastId = showBroadcastingToast('Register Handle');
  try {
    await registerHandle({ handle: handle.value, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.registerHandle') }}</DialogTitle>
      <DialogDescription>@{{ register }}</DialogDescription>

      <div class="flex flex-col w-full gap-4">
        <InputPhoton
          v-if="!configStore.config.defaultAmountEnabled"
          v-model="inputPhotonModel"
          @on-validity-change="handleInputValidity"
        />
        <Button class="w-full" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
