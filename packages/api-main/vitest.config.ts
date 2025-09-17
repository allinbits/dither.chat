import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        sequence: {
            setupFiles: 'list',
        },
        globalSetup: './tests/setup.ts',
        forceRerunTriggers: [
            '**/tests/**/*',
        ],
        reporters: ['verbose'],
    },
    define: {
        'process.env.SKIP_START': JSON.stringify(true),
        'process.env.PG_URI': JSON.stringify('postgresql://default:password@localhost:5432/postgres'),
        'process.env.JWT': JSON.stringify('default_jwt_secret'),
        'process.env.JWT_STRICTNESS': JSON.stringify('lax'),
        'process.env.AUTH': JSON.stringify('whatever'),
    },
});
