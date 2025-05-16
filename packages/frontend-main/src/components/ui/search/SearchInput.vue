<script setup lang="ts">
import { ref, watch } from 'vue';
import { refDebounced } from '@vueuse/core';
import { CircleX } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{ placeholder?: string }>(),
    { placeholder: 'Type to search...' },
);

const searchKeyword = ref<string>('');
const debouncedSearchKeyword = refDebounced(searchKeyword, 200);

const results = ref<string[]>([]);

watch(debouncedSearchKeyword, (value: string) => {
    if (value) {
        results.value.push(value);
    }
});

const clearSearch = () => {
    searchKeyword.value = '';
    results.value = [];
};

</script>

<template>
  <div>
    <div class="flex items-center gap-2 relative">
      <input
        v-model="searchKeyword"
        :placeholder="props.placeholder"
        class="bg-neutral-200 p-2 h-[44px] flex-1 pr-10"
      />

      <CircleX
        v-if="searchKeyword"
        @click="clearSearch"
        class="size-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
      />
    </div>

    <div v-if="results.length > 0"
         class="results-list border-neutral-200 border-1 max-h-[60vh] p-2 rounded-b-md overflow-y-auto overflow-x-hidden"
    >
      <div v-for="(result, index) in results" :key="index" class="pb-2">
        {{ result }}
      </div>
    </div>
  </div>
</template>
