import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Disabled: crashes with TS 5.9 + typescript-eslint 8.x (reading 'isolatedDeclarations')
      '@typescript-eslint/consistent-generic-constructors': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.*'],
  },
);
