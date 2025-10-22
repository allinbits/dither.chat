import antfu from '@antfu/eslint-config';

export default antfu(
  {
    typescript: true,
    vue: true,
    jsonc: true,
    yaml: true,
    markdown: true,
    formatters: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },
  },
  {
    files: ['tsconfig.json', 'package.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
);
