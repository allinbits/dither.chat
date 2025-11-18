import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs text-base font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground focus:bg-accent focus:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 dark:active:bg-input/50 dark:focus:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:bg-accent active:text-accent-foreground dark:active:bg-accent/50',
        navigation:
          'justify-start rounded-md hover:bg-accent/50 active:bg-accent transition-colors',
        icon:
          'rounded-full hover:bg-accent active:bg-accent transition-colors p-0',
        link: 'text-primary underline-offset-4 hover:underline active:underline',
        elevated:
          'rounded-md border border-border/70 bg-background/60 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] hover:border-border hover:bg-background/85 hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] active:bg-background/95 active:shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] transition-all duration-200',
      },
      size: {
        default: 'h-13 px-4 has-[>svg]:px-3',
        xs: 'h-8 rounded-xs gap-1 px-2 has-[>svg]:px-1.5',
        sm: 'h-10 rounded-xs gap-1.5 px-3 has-[>svg]:px-2.5',
        nav: 'h-11 px-3 gap-2.5',
        lg: 'h-15 rounded-xs px-6 has-[>svg]:px-4',
        icon: 'size-10',
        iconSm: 'size-[40px]',
        iconMd: 'size-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
