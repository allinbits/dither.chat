<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { useClipboard } from '@vueuse/core';
import { FlaskConical, Link2, Upload } from 'lucide-vue-next';

import Button from '../ui/button/Button.vue';
import Popover from '../ui/popover/Popover.vue';
import PopoverContent from '../ui/popover/PopoverContent.vue';
import PopoverTrigger from '../ui/popover/PopoverTrigger.vue';

import { cn } from '@/utility';

const { post } = defineProps<{ post: Post }>();

const { copy, copied } = useClipboard({ source: post.hash, copiedDuring: 3000 });

const buttonClass = 'flex flex-row items-center justify-start gap-2 w-full';
const buttonLabelClass = 'text-sm font-semibold';

</script>

<template>
  <Popover>
    <PopoverTrigger @click.stop>
      <Upload class="size-5" color="#A2A2A9" />
    </PopoverTrigger>

    <PopoverContent class="p-2">
      <Button @click="copy" size="sm" :class="cn(buttonClass, 'justify-between')" variant="ghost">
        <div class="flex flex-row items-center gap-2">
          <Link2 class="size-5" />
          <span :class="buttonLabelClass">{{ $t('components.Button.copyLink') }}</span>
        </div>
        <span v-if="copied" class="text-xs font-normal">{{ $t('feedbacks.copied') }}</span>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost">
        <FlaskConical class="size-5" />
        <span :class="buttonLabelClass">Do something</span>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost">
        <FlaskConical class="size-5" />
        <span :class="buttonLabelClass">Do something</span>
      </Button>
    </PopoverContent>
  </Popover>
</template>
