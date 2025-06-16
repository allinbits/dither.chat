<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Loader } from 'lucide-vue-next';

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

const isBalanceInputValid = ref(false);
const message = ref('');

const MAX_CHARS = 512 - 'dither.Post("")'.length;

const { createPost, txError, txSuccess } = useCreatePost();

const { isProcessing, isShown, photonValue, handleClose } = useTxDialog<object>('newPost', 'Post', txSuccess, txError);

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

const canSubmit = computed(() => {
    return isBalanceInputValid.value && message.value.length > 0;
});

function capChars(event: { target: HTMLTextAreaElement }) {
    if (event.target.value.length > MAX_CHARS) {
        event.target.value = event.target.value.substring(0, MAX_CHARS);
    }
}

async function handleSumbit() {
    if (!canSubmit.value) {
        return;
    }
    await createPost({ message: message.value, photonValue: photonValue.value });
    message.value = '';
    handleClose();
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleClose">
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <Textarea :placeholder="$t('placeholders.post')" v-model="message" @input="capChars" :maxlength="MAX_CHARS" v-if="!isProcessing && !txSuccess" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4" v-if="!isProcessing && !txSuccess">
          <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
          <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
          <Button class="w-full" :disabled="!canSubmit" @click="handleSumbit">
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
  </div>
</template>
