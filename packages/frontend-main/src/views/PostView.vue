<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Decimal } from '@cosmjs/math';
import { Loader } from 'lucide-vue-next';

import { useCreateReply } from '@/composables/useCreateReply';
import { usePost } from '@/composables/usePost';
import { useReplies } from '@/composables/useReplies';
import { useWallet } from '@/composables/useWallet';

import ViewHeading from './ViewHeading.vue';

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
import { fractionalDigits } from '@/utility/atomics';

const route = useRoute();
const hash = computed(() =>
    typeof route.params.hash === 'string' ? route.params.hash : '',
);
const { data: post, isLoading, isError, error } = usePost({
    hash,
});
const wallet = useWallet();
const repliesQuery = useReplies({ hash });
const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const reply = ref('');
const isBalanceInputValid = ref(false);
const inputPhotonModel = ref(Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());

const { createReply,
    txError } = useCreateReply();

const isProcessing = computed(() => {
    return wallet.processState.value !== 'idle';
});
const canReply = computed(() => {
    return isBalanceInputValid.value && reply.value.length > 0;
});

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}
async function handleReply() {
    if (!canReply.value || !post.value) {
        return;
    }
    await createReply({ parentPost: post, message: reply.value, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    reply.value = '';
}
</script>

<template>
  <MainLayout>
    <ViewHeading :title="$t('components.Headings.post')"/>

    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col py-4 pl-4 pr-2 w-full">
      <div class="flex flex-row justify-between items-center h-[40px]">
        <RouterLink :to="`/profile/${post.author}`">
          <div class="flex flex-row gap-3">
            <UserAvatarUsername :userAddress="post.author" />
          </div>
        </RouterLink>
        <PostMoreActions :post="post" />
      </div>
      <PostMessage :message="post.message" class="mt-2" />
      <PrettyTimestamp :timestamp="new Date(post.timestamp)" isFullDate class="self-start mt-4" />

      <div class="pr-2">

        <div class="mt-4 border-y">
          <PostActions :post="post" />
        </div>

        <!-- Broadcast Status -->
        <div class="flex flex-col w-full gap-2 mt-4" v-if="isProcessing">
          {{  $t('components.Wallet.popupSign') }}
          <Loader class="animate-spin w-full"/>
        </div>
        <!-- Transaction Form -->
        <template v-if="wallet.loggedIn.value && !isProcessing">
          <div class="flex flex-row item-center mt-4">
            <UserAvatar :userAddress="wallet.address.value" disabled/>
            <Textarea :placeholder="$t('placeholders.reply')" v-model="reply" :maxlength="MAX_CHARS" class="ml-1 mt-1" />
          </div>

          <div class="flex flex-row mt-4 gap-4">
            <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
            <Button size="sm" :disabled="!canReply" @click="handleReply">
              {{ $t('components.Button.reply') }}
            </Button>
          </div>

          <!-- TX error -->
          <span v-if="txError" class="text-red-500 text-left text-xs mt-2">{{ txError }}</span>
        </template>
      </div>
    </div>

    <!-- Replies posts list -->
    <PostsList :query="repliesQuery" hideEmptyText/>
  </MainLayout>
</template>
