<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useBalanceFetcher } from '@/composables/useBalanceFetcher';
import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';

const popups = usePopups();
const wallet = useWallet();
const balanceFetcher = useBalanceFetcher();

const photonValue = ref(1);
const txError = ref<string>();
const txSuccess = ref<string>();
const isBalanceInputValid = ref(false);
const message = ref('');

const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);

async function handleSubmit() {
    if (!popups.state.reply) {
        return;
    }

    const result = await wallet.dither.reply(
        popups.state.reply.hash,
        message.value,
        BigInt(photonValue.value).toString(),
    );
    if (!result.broadcast) {
        txError.value = result.msg;
        return;
    }

    txSuccess.value = result.tx?.transactionHash;
    if (txSuccess.value) {
        message.value = '';
    }
}

const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});

function handleClose() {
    popups.state.reply = null;
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

watch(wallet.loggedIn, async () => {
    if (!wallet.loggedIn.value) {
        return;
    }

    balanceFetcher.updateAddress(wallet.address.value);
});
</script>

<template>
  <div>
    <Dialog :open="popups.state.reply !== null" @update:open="handleClose" v-if="popups.state.reply !== null">
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.reply') }}</DialogTitle>

        <div v-if="!isBroadcasting && !txSuccess" class="flex flex-row gap-3 border-b pb-3">
          <UserAvatar :userAddress="popups.state.reply.author" />
          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row gap-3 pt-2.5">
              <Username :userAddress="popups.state.reply.author" />
              <PrettyTimestamp :timestamp="new Date(popups.state.reply.timestamp)" />
            </div>
            <PostMessage :post="popups.state.reply" />
          </div>
        </div>

        <Textarea
          placeholder="Write your reply"
          v-model="message"
          @input="capChars"
          v-if="!isBroadcasting && !txSuccess"
        />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4" v-if="!isBroadcasting && !txSuccess">
          <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
          <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
          <Button
            class="w-full"
            :disabled="!canSubmit"
            @click="isBalanceInputValid ? handleSubmit() : () => {}"
          >
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
        <!-- Broadcast Status -->
        <div class="flex flex-col w-full gap-4" v-if="isBroadcasting && !txSuccess">
          {{ $t('components.Wallet.popupSign') }}
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
