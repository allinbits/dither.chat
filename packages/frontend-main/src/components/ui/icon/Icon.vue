<template>
  <KeepAlive>
    <div class="inline-flex items-center text-300">
      <svg
        v-if="gradient || (gradientFrom && gradientTo)"
        aria-hidden="true"
        focusable="false"
        style="width: 0; height: 0; position: absolute"
      >
        <defs>
          <linearGradient
            :id="id"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              :stop-color="gradientFrom ?? '' "
            />
            <stop
              offset="100%"
              :stop-color="gradientTo ?? '' "
            />
          </linearGradient>
        </defs>
      </svg>
      <Suspense>
        <component
          :is="ico"
          :class="{
            'mr-1 mb-px': $slots['default'] && !container,
            'svg-gradient': gradient || (gradientFrom && gradientTo),
          }"
          :style="`width:${size}em; height:${size}em;`"
          :aria-hidden="$slots['default'] ? true : undefined"
          :focusable="$slots['default'] ? true : undefined"
        />

        <!-- loading state -->
        <template #fallback>
          <span
            class="inline-flex"
            :style="`width:${size}em;`"
          />
        </template>
      </Suspense>
      <template v-if="$slots['default']">
        <span
          class="ml-1 text-small-reg"
          :class="[gradient && 'text-gradient']"
        ><slot /></span>
      </template>
    </div>
  </KeepAlive>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';

interface Props {
    icon: string;
    container?: '' | 'small';
    size?: number;
    gradient?: boolean;
    gradientFrom?: string;
    gradientTo?: string;
}

const props = withDefaults(defineProps<Props>(), {
    container: '',
    size: 1,
    gradient: false,
    gradientFrom: undefined,
    gradientTo: undefined,
});

const id = ref('');
const idUrl = ref('');

if (props.gradient || (props.gradientFrom && props.gradientTo)) {
    id.value = crypto.randomUUID();
    idUrl.value = `url(#${id.value})`;
}

const titleCase = (content: string) => content && content[0].toUpperCase() + content.slice(1).toLowerCase();

const ico = computed(() => {
    const ico = props.icon;
    const container = props.container;
    return defineAsyncComponent(() => import(`@/components/ui/icons/${titleCase(ico) + titleCase(container)}.vue`));
});
</script>
<style scoped>
.svg-gradient :deep(:is(path, rect, polygon, ellipse, circle)) {
  fill: v-bind("idUrl");
}
</style>
