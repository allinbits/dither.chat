<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { usePost } from '@/composables/usePost';
import { useReplies } from '@/composables/useReplies';
import { useWallet } from '@/composables/useWallet';

import PostActions from '@/components/posts/PostActions.vue';
import PostMessage from '@/components/posts/PostMessage.vue';
import PostsList from '@/components/posts/PostsList.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import Button from '@/components/ui/button/Button.vue';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const hash = typeof route.params.hash === 'string' ? route.params.hash : '';
const postHash = typeof route.params.postHash === 'string' ? route.params.postHash : undefined;
const { data: post, isLoading, isError, error } = usePost({
    hash, postHash,
});
const wallet = useWallet();
const query = useReplies({ hash });
const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const reply = ref('');
const isBalanceInputValid = ref(false);
const photonValue = ref(1);
const txError = ref<string>();
const txSuccess = ref<string>();
const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});
const canReply = computed(() => {
    return isBalanceInputValid.value && reply.value.length > 0;
});
function capChars(event: { target: HTMLTextAreaElement }) {
    if (event.target.value.length > MAX_CHARS) {
        event.target.value = event.target.value.substring(0, MAX_CHARS);
    }
}
function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}
async function handleReply() {
    if (!post.value) return;
    const result = await wallet.dither.reply(
        post.value.hash,
        reply.value,
        BigInt(photonValue.value).toString(),
    );
    if (!result.broadcast) {
        txError.value = result.msg;
        return;
    }
    txSuccess.value = result.tx?.transactionHash;
    if (txSuccess.value) {
        reply.value = '';
    }
}
</script>

<!-- TODO: Refresh replies post list after replying -->

<template>
  <MainLayout>
    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col p-4 w-full ">
      <UserAvatarUsername :userAddress="post.author" class="mb-2" />
      <PostMessage :post="post" />
      <PrettyTimestamp :timestamp="new Date(post.timestamp)" :isFullDate="true" class="flex mt-4" />

      <div class="py-2 mt-4 border-y">
        <PostActions :post="post" class="px-2" />
      </div>

      <!-- Broadcast Status -->
      <span v-if="isBroadcasting && !txSuccess" class="mt-4">{{ $t('components.Wallet.popupSign') }}</span>

      <!-- Transaction Form -->
      <template v-if="wallet.loggedIn.value && !isBroadcasting">
        <div class="flex flex-row item-center mt-4">
          <UserAvatar :userAddress="wallet.address.value" />
          <Textarea :placeholder="$t('placeholders.yourReply')" v-model="reply" @input="capChars" class="mt-1" />
        </div>

        <div class="flex flex-row mt-4 gap-4">
          <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
          <Button size="sm" :disabled="!canReply" @click="isBalanceInputValid ? handleReply() : () => { }">
            {{ $t('components.Button.reply') }}
          </Button>
        </div>

        <!-- TX error -->
        <span v-if="txError" class="text-red-500 text-left text-xs mt-2">{{ txError }}</span>
      </template>
    </div>

    <!-- Replies posts list -->
    <PostsList :query="query" />
  </MainLayout>
</template>
