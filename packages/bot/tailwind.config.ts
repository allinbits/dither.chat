import type { Config } from "tailwindcss";

import { breakpoints } from './src/utility/breakpoints';

export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        screens: breakpoints,
    },
} satisfies Config;
