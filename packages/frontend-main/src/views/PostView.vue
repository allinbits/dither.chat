<script setup lang="ts">
import { Decimal } from '@cosmjs/math';
import { Loader } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import PostActions from '@/components/posts/PostActions.vue';
import PostContent from '@/components/posts/PostContent.vue';
import PostMoreActions from '@/components/posts/PostMoreActions.vue';
import PostsList from '@/components/posts/PostsList.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import Button from '@/components/ui/button/Button.vue';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useCreateReply } from '@/composables/useCreateReply';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useFractionalDigits } from '@/composables/useFractionalDigits';
import { usePost } from '@/composables/usePost';
import { useReplies } from '@/composables/useReplies';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { routesNames } from '@/router';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

import ViewHeading from './ViewHeading.vue';

const wallet = useWallet();
const { isDefaultAmountInvalid } = useDefaultAmount();
const router = useRouter();
const route = useRoute();
const hash = computed(() =>
  typeof route.params.hash === 'string' ? route.params.hash : '',
);
const { data: post, isLoading, isError, error } = usePost({
  hash,
});
const repliesQuery = useReplies({ hash });
const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const reply = ref('');
const showReply = ref(false);
const isBalanceInputValid = ref(false);
const fractionalDigits = useFractionalDigits();
const inputPhotonModel = ref(Decimal.fromAtomics('1', fractionalDigits).toFloatApproximation());
const configStore = useConfigStore();
const amountAtomics = computed(() =>
  configStore.config.defaultAmountEnabled
    ? configStore.config.defaultAmountAtomics
    : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics,
);
const { createReply } = useCreateReply();

const canReply = computed(() => {
  return (isBalanceInputValid.value || configStore.config.defaultAmountEnabled) && reply.value.length > 0;
});

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}
async function handleReply() {
  if (!canReply.value || !post.value) {
    return;
  }
  const toastId = showBroadcastingToast('Reply');
  try {
    await createReply({ parentPost: post, message: reply.value, amountAtomics: amountAtomics.value });
    reply.value = '';
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <MainLayout>
    <ViewHeading :title="$t('components.Headings.post')" />

    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col py-4 pl-4 pr-2 w-full">
      <div class="flex flex-row justify-between items-center h-[40px]">
        <RouterLink :to="`/profile/${post.author}`">
          <div class="flex flex-row gap-3">
            <UserAvatarUsername :user-address="post.author" />
          </div>
        </RouterLink>
        <PostMoreActions :post="post" />
      </div>
      <PostContent :message="post.message" class="mt-2" />
      <PrettyTimestamp :timestamp="new Date(post.timestamp)" is-full-date class="self-start mt-4" />

      <div class="pr-2">
        <div class="mt-4 border-y">
          <PostActions :post="post" />
        </div>

        <!-- Transaction Form -->
        <div v-if="wallet.loggedIn.value" class="flex flex-col gap-4 mt-4">
          <template v-if="showReply">
            <div v-if="isDefaultAmountInvalid" class="flex flex-col items-right gap-4">
              <span class="text-sm whitespace-pre-line">{{ $t('components.PostView.invalidDefaultAmount') }}</span>
              <Button size="sm" class="ml-auto" @click="router.push({ name: routesNames.settingsDefaultAmount });">
                {{ $t('components.Button.adjustDefaultAmount') }}
              </Button>
            </div>

            <template v-else>
              <div class="flex flex-row item-center">
                <UserAvatar :user-address="wallet.address.value" disabled />
                <Textarea v-model="reply" :placeholder="$t('placeholders.reply')" :maxlength="MAX_CHARS" class="ml-1 mt-1" />
              </div>

              <div class="flex flex-row gap-4">
                <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
                <Button size="sm" :disabled="!canReply" class="ml-auto" @click="handleReply">
                  {{ $t('components.Button.reply') }}
                </Button>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="flex flex-row p-3 border-t border-gray-200 items-center justify-between">
      <div class="text-lg font-semibold">
        Replies
      </div>
      <Button v-if="wallet.loggedIn.value" size="sm" class="ml-auto" @click="showReply = !showReply">
        {{ showReply ? $t('components.Button.closeReply') : $t('components.Button.createReply') }}
      </Button>
    </div>
    <!-- Replies posts list -->
    <PostsList :query="repliesQuery" hide-empty-text />
  </MainLayout>
</template>
