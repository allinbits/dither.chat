<script lang="ts" setup>
import { Camera, X } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

import Avatar from '@/components/ui/avatar/Avatar.vue';
import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue';
import AvatarImage from '@/components/ui/avatar/AvatarImage.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  ResponsiveDialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePopups } from '@/composables/usePopups';
import { useProfileImages } from '@/composables/useProfileImages';
import { useWallet } from '@/composables/useWallet';

const MAX_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 160;

const popups = usePopups();
const wallet = useWallet();
const { avatarUrl, avatarImageClass } = useProfileImages(wallet.address);

const isShown = computed(() => popups.state.editProfile !== null);

const name = ref('');
const bio = ref('');
const bannerPreview = ref<string | null>(null);
const avatarPreview = ref<string | null>(null);
const bannerFileInput = ref<HTMLInputElement | null>(null);
const avatarFileInput = ref<HTMLInputElement | null>(null);

function resetForm() {
  name.value = '';
  bio.value = '';
  bannerPreview.value = null;
  avatarPreview.value = null;
}

function handleBannerChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      bannerPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

const canSave = computed(() =>
  name.value.trim().length > 0
  || bio.value.trim().length > 0
  || bannerPreview.value !== null
  || avatarPreview.value !== null,
);

function handleClose() {
  popups.hide('editProfile');
  resetForm();
}

async function handleSave() {
  if (!canSave.value) return;

  // TODO: Implement API call to save profile
  console.log('Saving profile:', {
    name: name.value,
    bio: bio.value,
    banner: bannerPreview.value,
    avatar: avatarPreview.value,
  });

  handleClose();
}

watch(isShown, (newValue) => {
  if (newValue) resetForm();
});
</script>

<template>
  <Dialog v-if="isShown" :open="isShown" @update:open="handleClose">
    <ResponsiveDialogContent class="max-w-[600px] p-0">
      <!-- Header -->
      <div class="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded-full p-2 transition-colors hover:bg-accent"
            @click="handleClose"
          >
            <X class="size-5" />
            <span class="sr-only">Close</span>
          </button>
          <DialogTitle class="text-xl font-semibold">
            Edit profile
          </DialogTitle>
        </div>
        <Button
          :disabled="!canSave"
          class="rounded-full px-4 py-2 font-semibold"
          @click="handleSave"
        >
          Save
        </Button>
      </div>

      <!-- Content -->
      <div class="flex flex-col">
        <!-- Banner Section -->
        <div class="group relative h-[200px] w-full bg-muted">
          <img
            v-if="bannerPreview"
            :src="bannerPreview"
            alt="Banner preview"
            class="h-full w-full object-cover"
          >
          <div class="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/85"
              :class="bannerPreview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'"
              @click="bannerFileInput?.click()"
            >
              <Camera class="size-5" />
              <span class="text-sm font-medium">Add banner photo</span>
            </button>
          </div>
          <input
            ref="bannerFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleBannerChange"
          >
        </div>

        <!-- Avatar Section -->
        <div class="relative -mt-16 mb-4 flex items-end px-4">
          <div class="relative">
            <Avatar class="size-32 border-4 border-background">
              <AvatarImage
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Avatar preview"
              />
              <AvatarImage
                v-else-if="avatarUrl"
                :class="avatarImageClass"
                :src="avatarUrl"
                alt="user-avatar-image"
              />
              <AvatarFallback class="bg-muted" />
            </Avatar>
            <button
              type="button"
              class="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-black/75 p-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/85"
              @click="avatarFileInput?.click()"
            >
              <Camera class="size-5" />
              <span class="sr-only">Add avatar photo</span>
            </button>
          </div>
          <input
            ref="avatarFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleAvatarChange"
          >
        </div>

        <!-- Form Fields -->
        <div class="flex flex-col gap-4 px-4 pb-4">
          <!-- Name -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <Input
              v-model="name"
              :maxlength="MAX_NAME_LENGTH"
              placeholder="Name"
              class="text-base"
            />
          </div>

          <!-- Bio -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-muted-foreground">
              Bio
            </label>
            <Textarea
              v-model="bio"
              :maxlength="MAX_BIO_LENGTH"
              placeholder="Bio"
              class="min-h-[72px] resize-none text-base"
            />
            <div class="text-right text-xs text-muted-foreground">
              {{ bio.length }} / {{ MAX_BIO_LENGTH }}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
