import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

export default {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.md'] }),
  ],
  kit: {
    adapter: adapter({ fallback: '404.html' }),
    prerender: {
      entries: ['*'],
      // GitHub Pages 子路径部署时，fallback 404 页内对根 `/` 的引用不应阻断构建。
      handleHttpError: ({ path, message }) => {
        if (path === '/') return;
        throw new Error(message);
      },
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
    },
  },
};
