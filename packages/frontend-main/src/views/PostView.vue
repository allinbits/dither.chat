<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { useCreateReply } from '@/composables/useCreateReply';
import { usePost } from '@/composables/usePost';
import { useReplies } from '@/composables/useReplies';
import { useWallet } from '@/composables/useWallet';

import PostActions from '@/components/posts/PostActions.vue';
import PostMessage from '@/components/posts/PostMessage.vue';
import PostMoreActions from '@/components/posts/PostMoreActions.vue';
import PostsList from '@/components/posts/PostsList.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import Button from '@/components/ui/button/Button.vue';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const hash = computed(() =>
    typeof route.params.hash === 'string' ? route.params.hash : '',
);
const postHash = computed(() =>
    typeof route.params.postHash === 'string' && route.params.postHash.length ? route.params.postHash : null,
);
const { data: post, isLoading, isError, error } = usePost({
    hash, postHash,
});
const wallet = useWallet();
const repliesQuery = useReplies({ hash });
const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const reply = ref('');
const isBalanceInputValid = ref(false);
const photonValue = ref(1);

const { createReply,
    txError } = useCreateReply();

const isProcessing = computed(() => {
    return wallet.processState.value !== 'idle';
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
    if (!canReply.value || !post.value) {
        return;
    }
    await createReply({ parentPost: post, message: reply.value, photonValue: photonValue.value });
    reply.value = '';
}
</script>

<template>
  <MainLayout>
    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col p-4 w-full">
      <div class="flex flex-row justify-between items-center h-[40px]">
        <RouterLink :to="`/profile/${post.author}`">
          <div class="flex flex-row gap-3">
            <UserAvatarUsername :userAddress="post.author" />
            <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
          </div>
        </RouterLink>
        <PostMoreActions :post="post" />
      </div>
      <PostMessage :message="post.message" class="mt-2" />
      <PrettyTimestamp :timestamp="new Date(post.timestamp)" :isFullDate="true" class="flex mt-4" />

      <div class="py-2 mt-4 border-y">
        <PostActions :post="post" class="px-2" />
      </div>

      <!-- Broadcast Status -->
      <div class="flex flex-col w-full gap-2 mt-4" v-if="isProcessing">
        {{  $t('components.Wallet.popupSign') }}
        <Loader class="animate-spin w-full"/>
      </div>
      <!-- Transaction Form -->
      <template v-if="wallet.loggedIn.value && !isProcessing">
        <div class="flex flex-row item-center mt-4">
          <UserAvatar :userAddress="wallet.address.value" />
          <Textarea :placeholder="$t('placeholders.reply')" v-model="reply" @input="capChars" class="mt-1" />
        </div>

        <div class="flex flex-row mt-4 gap-4">
          <InputPhoton v-model="photonValue" @on-validity-change="handleInputValidity" />
          <Button size="sm" :disabled="!canReply" @click="handleReply">
            {{ $t('components.Button.reply') }}
          </Button>
        </div>

        <!-- TX error -->
        <span v-if="txError" class="text-red-500 text-left text-xs mt-2">{{ txError }}</span>
      </template>
    </div>

    <!-- Replies posts list -->
    <PostsList :query="repliesQuery" hideEmptyText/>
  </MainLayout>
</template>
