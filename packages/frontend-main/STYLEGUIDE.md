# Frontend-Main Style Guide

## Code Style & Patterns

This document defines the coding standards, patterns, and constraints for the Dither.chat frontend application. Follow these guidelines to maintain consistency and code quality.

## Core Principles

### 1. TypeScript First

- **Strict mode enabled** - No implicit any types
- **Explicit typing** for all function parameters and return values
- **Interface definitions** for complex objects
- **Generic types** for reusable components and functions

### 2. Composition API Only

- **`<script setup>` syntax** for all components
- **No Options API** - Use Composition API exclusively
- **Reactive refs** over reactive objects when possible
- **Computed properties** for derived state

### 3. Component Composition

- **Single responsibility** - One component, one purpose
- **Props down, events up** - Clear data flow
- **Composables for logic** - Extract reusable business logic
- **Atomic design** - Build from smallest to largest components

## Code Formatting

### Prettier Configuration

```json
{
  "tabWidth": 4,
  "singleQuote": true,
  "semi": true,
  "printWidth": 120
}
```

### Indentation & Spacing

- **4 spaces** for indentation (no tabs)
- **Single quotes** for strings
- **Semicolons** required
- **120 character** line limit
- **Trailing commas** in objects and arrays

## Component Structure

### Standard Component Template

```vue
<script setup lang="ts">
// 1. External imports first
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import Button from '@/components/ui/button/Button.vue';
// 2. Internal imports (composables, components, utilities)
import { useWallet } from '@/composables/useWallet';
import { useConfigStore } from '@/stores/useConfigStore';
import { cn } from '@/utility';

// 3. Type definitions
interface Props {
  title: string;
  isVisible?: boolean;
}

interface Emits {
  close: [];
  submit: [value: string];
}

// 4. Props and emits
const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits<Emits>();

// 5. Composables and stores
const router = useRouter();
const wallet = useWallet();
const configStore = useConfigStore();

// 6. Reactive state
const isLoading = ref(false);
const formData = ref('');

// 7. Computed properties
const isDisabled = computed(() => {
  return isLoading.value || !wallet.loggedIn.value;
});

// 8. Methods
function handleSubmit() {
  if (!formData.value)
    return;

  isLoading.value = true;
  emit('submit', formData.value);
  isLoading.value = false;
}

// 9. Lifecycle hooks
onMounted(() => {
  // Initialization logic
});
</script>

<template>
  <div :class="cn('component-wrapper', props.isVisible && 'visible')">
    <h2>{{ props.title }}</h2>
    <Button :disabled="isDisabled" @click="handleSubmit">
      Submit
    </Button>
  </div>
</template>
```

## Naming Conventions

### Files & Directories

- **Components**: `PascalCase.vue` (e.g., `PostItem.vue`)
- **Composables**: `camelCase.ts` starting with `use` (e.g., `useWallet.ts`)
- **Stores**: `camelCase.ts` starting with `use` (e.g., `useWalletStateStore.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatCompactNumber.ts`)
- **Types**: `camelCase.ts` (e.g., `userTypes.ts`)
- **Constants**: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

### Variables & Functions

- **Variables**: `camelCase` (e.g., `userAddress`, `isLoading`)
- **Functions**: `camelCase` (e.g., `handleSubmit`, `formatAmount`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_CHARS`, `DEFAULT_GAS_LIMIT`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `WalletState`)
- **Enums**: `PascalCase` (e.g., `WalletType`, `TransactionStatus`)

### CSS Classes

- **Tailwind classes** preferred over custom CSS
- **Custom classes**: `kebab-case` (e.g., `post-item`, `wallet-connect`)
- **CSS variables**: `--kebab-case` (e.g., `--main-width`, `--border-radius`)

## TypeScript Patterns

### Props Definition

```typescript
// Good - Explicit interface
interface Props {
  title: string;
  isVisible?: boolean;
  items: Array<{ id: string; name: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

// Bad - Inline props
const props = defineProps<{
  title: string;
  isVisible?: boolean;
}>();
```

### Emits Definition

```typescript
// Good - Explicit interface
interface Emits {
  update: [value: string];
  close: [];
  error: [error: Error];
}

const emit = defineEmits<Emits>();

// Bad - String-based emits
const emit = defineEmits(['update', 'close', 'error']);
```

### Composables Pattern

```typescript
// Good - Return object with named properties
export function useWallet() {
  const address = ref('');
  const isConnected = computed(() => !!address.value);

  function connect() {
    // Connection logic
  }

  return {
    address: readonly(address),
    isConnected,
    connect,
  };
}

// Bad - Return array
export function useWallet() {
  const address = ref('');
  return [address, connect];
}
```

## Styling Guidelines

### Tailwind CSS Usage

```vue
<template>
  <!-- Good - Semantic class grouping -->
  <div class="flex flex-col gap-4 p-6 bg-background border border-border rounded-lg">
    <h2 class="text-xl font-semibold text-foreground">
      Title
    </h2>
    <p class="text-sm text-muted-foreground">
      Description
    </p>
  </div>

  <!-- Bad - Random class order -->
  <div class="p-6 flex gap-4 border-border bg-background text-xl rounded-lg flex-col" />
</template>
```

### CSS Custom Properties

```css
/* Good - Use design tokens */
.component {
  background-color: var(--background);
  color: var(--foreground);
  border-radius: var(--radius);
}

/* Bad - Hard-coded values */
.component {
  background-color: #ffffff;
  color: #000000;
  border-radius: 8px;
}
```

### Component Styling

```vue
<script setup lang="ts">
// Good - Use cn utility for conditional classes
import { cn } from '@/utility';

const props = defineProps<{
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}>();

const buttonClasses = computed(() =>
  cn('px-4 py-2 rounded-md font-medium transition-colors', {
    'bg-primary text-primary-foreground': props.variant === 'primary',
    'bg-secondary text-secondary-foreground': props.variant === 'secondary',
    'px-2 py-1 text-sm': props.size === 'sm',
    'px-4 py-2': props.size === 'md',
    'px-6 py-3 text-lg': props.size === 'lg',
  }),
);
</script>
```

## State Management Patterns

### Pinia Store Structure

```typescript
// Good - Clear store structure
export const useWalletStore = defineStore(
  'wallet',
  () => {
    // State
    const address = ref('');
    const isConnected = ref(false);

    // Getters
    const shortAddress = computed(() => (address.value ? shorten(address.value) : ''));

    // Actions
    function setAddress(newAddress: string) {
      address.value = newAddress;
      isConnected.value = !!newAddress;
    }

    function disconnect() {
      address.value = '';
      isConnected.value = false;
    }

    return {
      // State
      address: readonly(address),
      isConnected: readonly(isConnected),
      // Getters
      shortAddress,
      // Actions
      setAddress,
      disconnect,
    };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['address', 'isConnected'],
    },
  },
);
```

### TanStack Query Usage

```typescript
// Good - Proper query structure
export function useFeed() {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/feed?page=${pageParam}`);
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Common Anti-Patterns

### Avoid These Patterns

```vue
<!-- Bad - Options API -->
<script lang="ts">
export default {
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>

<!-- Bad - Inline styles -->
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    document.getElementById('button')?.addEventListener('click', handler);
});
</script>

<!-- Bad - Direct DOM manipulation -->
<script setup>
const props = defineProps<{ items: string[] }>();

function removeItem(index: number) {
    props.items.splice(index, 1); // Don't mutate props!
}
</script>

<!-- Bad - Mutating props -->
<template>
  <div style="color: red; font-size: 16px;">
    Text
  </div>
</template>
```

### Use These Patterns Instead

```vue
<!-- Good - Composition API -->
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<!-- Good - Tailwind classes -->
<script setup lang="ts">
const props = defineProps<{ items: string[] }>();
const emit = defineEmits<{ update: [items: string[]] }>();

function removeItem(index: number) {
  const newItems = props.items.filter((_, i) => i !== index);
  emit('update', newItems);
}
</script>

<!-- Good - Vue event handling -->
<template>
  <div class="text-red-500 text-base">
    Text
  </div>
</template>

<!-- Good - Emit events for prop changes -->
<template>
    <button @click="handleClick">Click me</button>
</template>
```

## Code Quality Rules

### Required Practices

1. **Type everything** - No `any` types without explicit justification
2. **Handle errors** - Always wrap async operations in try-catch
3. **Validate inputs** - Use TypeBox schemas for runtime validation
4. **Clean up resources** - Remove event listeners and cancel requests
5. **Test edge cases** - Handle loading, error, and empty states

### Performance Guidelines

1. **Use `readonly()`** for store state that shouldn't be mutated
2. **Debounce user input** - Use `refDebounced` for search and filters
3. **Lazy load components** - Use `defineAsyncComponent` for heavy components
4. **Optimize re-renders** - Use proper keys in v-for loops
5. **Cache expensive computations** - Use `computed()` for derived state

### Security Practices

1. **Sanitize user input** - Escape HTML and validate data
2. **Use HTTPS** - Never send sensitive data over HTTP
3. **Validate on client and server** - Don't trust client-side validation alone
4. **Handle wallet errors** - Gracefully handle wallet connection failures
5. **Rate limit requests** - Implement proper rate limiting

## Resources

- [Vue 3 Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TanStack Query Guide](https://tanstack.com/query/latest)

---

**Remember**: Consistency is key. When in doubt, follow existing patterns in the codebase.
