import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export { default as Tabs } from './RouterTabs.vue';

export const tabVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative rounded-none border-b-2 bg-transparent font-semibold shadow-none transition-none',
  {
    variants: {
      size: {
        default: 'p-4 text-base border-b-2',
        lg: 'p-6 text-lg border-b-4',
      },
      layout: {
        default: '',
        fill: 'flex-1',
      },
      state: {
        active: 'border-b-primary text-foreground',
        inactive: 'border-b-transparent text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'default',
      state: 'inactive',
    },
  },
);

export type TabVariants = VariantProps<typeof tabVariants>;
