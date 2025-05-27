<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<DialogRootProps>();
const emits = defineEmits<DialogRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

// NOTE: Normally we can just watch props.open
// but with current usage, we remove the dialog from DOM when not showing
// so we need to toggle overflow-hidden when component mounts and unmounts
onMounted(() => {
    const html = document.documentElement;
    const body = document.body;
    if (props.open) {
        html.classList.add('overflow-hidden');
        html.classList.add('h-full');
        body.classList.add('overflow-hidden');
        body.classList.add('h-full');
    }
});

onUnmounted(() => {
    const html = document.documentElement;
    const body = document.body;
    if (props.open) {
        html.classList.remove('overflow-hidden');
        html.classList.remove('h-full');
        body.classList.remove('overflow-hidden');
        body.classList.remove('h-full');
    }
});

</script>

<template>
  <DialogRoot
    data-slot="dialog"
    v-bind="forwarded"
  >
    <slot />
  </DialogRoot>
</template>
