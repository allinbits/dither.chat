<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useCreateReply } from '@/composables/useCreateReply';
import { useTxDialog } from '@/composables/useTxDialog';

import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';

const isBalanceInputValid = ref(false);
const message = ref('');

const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);

const { createReply, txError, txSuccess } = useCreateReply();

const {
    isProcessing,
    isShown,
    photonValue,
    popupState: reply,
    handleClose,
} = useTxDialog<Post>('reply', 'Reply', txSuccess, txError);

async function handleSumbit() {
    if (!canSubmit.value || !reply.value) {
        return;
    }
    await createReply({ parentPost: reply, message: message.value, photonValue: photonValue.value });
    message.value = '';
    handleClose();
}

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

function clearOnClose() {
    message.value = '';
    handleClose();
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="clearOnClose" >
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.reply') }}</DialogTitle>

        <div v-if="!isProcessing && !txSuccess" class="flex flex-row gap-3 border-b pb-3">
          <UserAvatar :userAddress="reply.author" />
          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row gap-3 pt-2.5">
              <Username :userAddress="reply.author" />
              <PrettyTimestamp :timestamp="new Date(reply.timestamp)" />
            </div>
            <PostMessage :message="reply.message" />
          </div>
        </div>

        <Textarea :placeholder="$t('placeholders.reply')" v-model="message" @input="capChars"
                  v-if="!isProcessing && !txSuccess" />

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
          {{ $t('components.Wallet.popupSign') }}
          <Loader class="animate-spin w-full" />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
