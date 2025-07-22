<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Decimal } from '@cosmjs/math';

import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useCreatePost } from '@/composables/useCreatePost';
import { useTxDialog } from '@/composables/useTxDialog';

import
{ Button }
    from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';

const MAX_CHARS = 512 - 'dither.Post("")'.length;
const message = ref('');
const isBalanceInputValid = ref(false);

const { createPost, txError, txSuccess } = useCreatePost();
const { showConfirmDialog } = useConfirmDialog();
const { isShown, inputPhotonModel, handleClose } = useTxDialog<object>('newPost', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

const canSubmit = computed(() => {
    return isBalanceInputValid.value && message.value.length > 0;
});

const handleCloseWithSaveDraft = () => {
    handleClose();

    if (!message.value.length) {
        return;
    }

    showConfirmDialog({
        title: 'Save to draft ?',
        description: 'Your post will be saved to draft and you can continue editing it later.',
        onCancel: () => {
            message.value = '';
        },
    });
};

async function handleSubmit() {
    if (!canSubmit.value) {
        return;
    }
    await createPost({ message: message.value, amountAtomics: amountAtomics.value });
    message.value = '';
    handleClose();
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleCloseWithSaveDraft">
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <Textarea :placeholder="$t('placeholders.post')" v-model="message" :maxlength="MAX_CHARS" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4">
          <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity"/>
          <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
          <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
