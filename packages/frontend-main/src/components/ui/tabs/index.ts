import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export { default as Tabs } from './RouterTabs.vue';

export const tabVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative rounded-none border-b bg-transparent font-medium shadow-none transition-colors',
  {
    variants: {
      size: {
        default: 'px-4 py-3 text-sm border-b-2',
        lg: 'px-5 py-4 text-base border-b-2',
      },
      layout: {
        default: '',
        fill: 'flex-1',
      },
      state: {
        active: 'border-b-primary text-foreground',
        inactive: 'border-b-transparent text-muted-foreground/70',
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
