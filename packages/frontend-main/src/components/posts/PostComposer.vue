<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, nextTick, onMounted, ref } from 'vue';

import PostEditorToolbar from '@/components/posts/PostEditorToolbar.vue';
import PostMediaThumbnail from '@/components/posts/PostMediaThumbnail.vue';
import { Button } from '@/components/ui/button';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';

const props = defineProps<{
  maxChars: number;
  placeholder: string;
}>();

const emit = defineEmits<{
  submit: [{ message: string; amountAtomics: string }];
}>();

const message = defineModel<string>({ required: true });

const isBalanceInputValid = ref(false);
const configStore = useConfigStore();
const inputPhotonModel = ref('0.1');
const textareaRef = ref<InstanceType<typeof Textarea>>();

const amountAtomics = computed(() => {
  if (configStore.config.defaultAmountEnabled) {
    return configStore.config.defaultAmountAtomics;
  }
  return Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics;
});

const canSubmit = computed(() => {
  return isBalanceInputValid.value && message.value.length > 0 && message.value.length <= props.maxChars;
});

const remainingChars = computed(() => props.maxChars - message.value.length);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

function handleInsertText(text: string) {
  // Ensure there's a space before inserting new text
  if (message.value.length > 0 && !message.value.endsWith(' ')) {
    message.value += ' ';
  }

  message.value += text;
}

function handleRemoveText(text: string) {
  message.value = message.value.replace(text, '').trim();
}

function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  emit('submit', {
    message: message.value,
    amountAtomics: amountAtomics.value,
  });
}

onMounted(async () => {
  await nextTick();
  const textarea = textareaRef.value?.$el as HTMLTextAreaElement | undefined;
  textarea?.focus();
});

defineExpose({
  reset: () => {
    message.value = '';
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <Textarea
      ref="textareaRef"
      v-model="message" :placeholder="placeholder" class="min-h-[74px] max-h-[270px] md:max-h-[300px] w-full break-all overflow-y-auto resize-none"
    />

    <PostMediaThumbnail :content="message" @remove-text="handleRemoveText" />

    <div class="flex items-center justify-between border-t pt-2">
      <PostEditorToolbar :content="message" @insert-text="handleInsertText" />
      <span class="text-[11px]" :class="remainingChars < 0 ? 'text-red-500' : 'text-muted-foreground'">
        {{ remainingChars }}
      </span>
    </div>

    <!-- Transaction Form -->
    <div class="flex flex-col w-full gap-4">
      <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
      <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
        {{ $t('components.Button.submit') }}
      </Button>
    </div>
  </div>
</template>
