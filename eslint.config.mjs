// @ts-check
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Type Safety Rules (تم تحسينها للأمان)
      '@typescript-eslint/no-explicit-any': 'warn', // تحذير بدلاً من إيقاف
      '@typescript-eslint/no-floating-promises': 'error', // مهم للتعامل مع async
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Code Quality Rules (قواعد جودة الكود)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off', // تعطيل القاعدة الأساسية لصالح TypeScript
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',

      // Best Practices (أفضل الممارسات)
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-includes': 'error',

      // NestJS Specific Rules (قواعد خاصة بـ NestJS)
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['constructors', 'decoratedFunctions'] },
      ],
      '@typescript-eslint/parameter-properties': 'warn',

      // General JavaScript Rules (قواعد JavaScript العامة)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',

      // Import Rules (قواعد الاستيراد)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unused-modules': 'warn',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // تعطيل لأن TypeScript يتولى هذا
      'import/named': 'off', // تعطيل لأن TypeScript يتولى هذا
      'import/default': 'off', // تعطيل لأن TypeScript يتولى هذا
      'import/namespace': 'off', // تعطيل لأن TypeScript يتولى هذا
      'import/newline-after-import': 'error',
      'import/no-anonymous-default-export': 'warn',
    },
  },
);
