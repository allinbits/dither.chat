import { builtinModules } from 'module';

import jsLint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import vueLint from 'eslint-plugin-vue';
import globals from 'globals';
import tsLint from 'typescript-eslint';

export default [
    // config parsers
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,jsx,tsx}'],
        languageOptions: {
            parser: tsLint.parser,
            parserOptions: {
                sourceType: 'module',
            },
        },
    },
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parser: vueLint.parser,
            parserOptions: {
                parser: '@typescript-eslint/parser',
                sourceType: 'module',
            },
        },
    },
    // config envs
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
    },
    // rules
    jsLint.configs.recommended,
    ...tsLint.configs.recommended,
    ...vueLint.configs['flat/essential'],
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            '@typescript-eslint/no-explicit-any': [
                'warn',
                { ignoreRestArgs: true },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        plugins: {
            'vue': vueLint,
            '@typescript-eslint': tsLint.plugin,
            'simple-import-sort': pluginSimpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        [
                            `node:`,
                            `^(${builtinModules.join('|')})(/|$)`,
                        ],
                        // style less,scss,css
                        ['^.+\\.less$', '^.+\\.s?css$'],
                        // Side effect imports.
                        ['^\\u0000'],
                        ['^@?\\w.*\\u0000$', '^[^.].*\\u0000$', '^\\..*\\u0000$'],
                        ['^vue', '^@vue', '^@?\\w', '^\\u0000'],
                        ['^@/utils'],
                        ['^@/composables'],
                        // Parent imports. Put `..` last.
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                        // Other relative imports. Put same-folder imports and `.` last.
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    ],
                },
            ],
            // see more vue rules: https://eslint.vuejs.org/rules/
            'vue/no-mutating-props': 'error',
            'vue/multi-word-component-names': 'off',
        },

    },
    // see: https://eslint.style/guide/getting-started
    // see: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/disable-legacy.ts
    stylistic.configs['disable-legacy'],
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: true,
        jsx: true,
    }),
    {
    // https://eslint.org/docs/latest/use/configure/ignore
        ignores: [
            'node_modules',
            '**/node_modules',
            '**/*.conf',
            '**/nginx/**',
        ],
    },
];
