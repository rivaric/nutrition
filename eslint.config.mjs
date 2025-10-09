import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    rules: {
      /* --- 🧠 Общие правила --- */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      /* --- 📦 Импорты --- */
      'import/order': 'off',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^@?\\w'],
            ['^(@|src)(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\./'],
            ['^.+\\.?(css|scss|svg|png|jpg|jpeg)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',

      /* --- ✅ Prettier --- */
      // включаем Prettier, конфиг берётся из .prettierrc автоматически
      'prettier/prettier': 'warn',
    },
  },
];
