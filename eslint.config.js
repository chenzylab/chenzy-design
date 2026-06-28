import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.svelte-kit/**',
      '**/*.svelte',
      '**/*.d.ts',
      'specs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off', // TS handles undefined globals
    },
  },
  {
    // 构建/配置类 JS 脚本（无 TS 类型兜底）：声明 Node 全局，避免 no-undef 误报。
    // 覆盖 *.config.* 与各包 scripts/ 下的 Node 脚本（如 clean-dist.mjs）。
    files: ['**/*.config.{js,mjs,cjs}', '**/scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
);
