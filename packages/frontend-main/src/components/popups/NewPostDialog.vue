<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Loader } from 'lucide-vue-next';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { useCreatePost } from '@/composables/useCreatePost';
import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

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

const popups = usePopups();
const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const photonValue = ref(1);
const isBalanceInputValid = ref(false);
const message = ref('');

const MAX_CHARS = 512 - 'dither.Post("")'.length;

const { createPost,
    txError,
    txSuccess } = useCreatePost();

const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});

function handleClose() {
    popups.state.newPost = null;
    txError.value = undefined;
    txSuccess.value = undefined;
    photonValue.value = 1;
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

watch([wallet.loggedIn, wallet.address], async () => {
    if (!wallet.loggedIn.value) {
        return;
    }

    balanceFetcher.updateAddress(wallet.address.value);
});

async function handleSumbit() {
    if (!canSubmit.value) {
        return;
    }
    await createPost({ message: message.value, photonValue: photonValue.value });
    message.value = '';
}
</script>

<template>
  <div>
    <Dialog :open="popups.state.newPost !== null" @update:open="handleClose" v-if="popups.state.newPost !== null">
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.newPost') }}</DialogTitle>

        <Textarea :placeholder="$t('placeholders.whatsUp')" v-model="message" @input="capChars" v-if="!isBroadcasting && !txSuccess" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4" v-if="!isBroadcasting && !txSuccess">
          <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
          <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
          <Button class="w-full" :disabled="!canSubmit" @click="handleSumbit">
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
  </div>
</template>
