import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
  define: {
    'process.env.SKIP_START': JSON.stringify(true),
  },
});
