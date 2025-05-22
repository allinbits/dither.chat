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
// const query = useFeed();

const message = ref('');
const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
function capChars(event: { target: HTMLTextAreaElement }) {
    if (event.target.value.length > MAX_CHARS) {
        event.target.value = event.target.value.substring(0, MAX_CHARS);
    }
}
const txSuccess = ref<string>();
const isBroadcasting = computed(() => {
    return wallet.isBroadcasting.value;
});

</script>

<template>
  <MainLayout>
    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col p-4 w-full ">
      <UserAvatarUsername :userAddress="post.author" class="mb-2" />
      <PostMessage :post="post" />
      <PrettyTimestamp :timestamp="new Date(post.timestamp)" :isFullDate="true" class="flex mt-5" />

      <div class="py-2 mt-4 border-y">
        <PostActions :post="post" class="px-2" />
      </div>

      <div v-if="wallet.loggedIn.value" class="flex flex-row item-center mt-5">
        <UserAvatar :userAddress="wallet.address.value" />

        <Textarea :placeholder="$t('placeholders.yourReply')" v-model="message" @input="capChars" v-if="!isBroadcasting && !txSuccess" class="mt-1"/>

      </div>
    </div>

    <PostsList :query="query"/>

  </MainLayout>
</template>
