import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.{test,spec}.ts'],
    // .svelte component tests will move to a jsdom project later
  },
});
