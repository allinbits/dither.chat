import type { Config } from 'tailwindcss';

import { breakpoints } from './src/lib/breakpoints';

export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontSize: {
                'xs': '0.8125rem',
                'sm': '0.9375rem',
                'base': '1.0625rem',
                'lg': '1.5rem',
                'xl': '1.6875rem',
                '2xl': '2rem',
            },
        },
        screens: breakpoints,
    },
} satisfies Config;
