import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

// Reference: https://ui.shadcn.com/docs/components/alert
export { default as Alert } from './Alert.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
  'relative w-full rounded-sm border px-3 py-2 text-xs grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-2 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default:
          'bg-card text-card-foreground',
        destructive:
          'text-destructive-foreground bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/90',
        warning:
          'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
