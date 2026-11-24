import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.expo/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: Object.fromEntries(['console','process','Buffer','fetch','URL','AbortSignal','AbortController','setTimeout','clearTimeout','setInterval','clearInterval'].map(name => [name,'readonly'])),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  { files: ['**/test/**'], rules: { '@typescript-eslint/no-explicit-any': 'off' } },
);
