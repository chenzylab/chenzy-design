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
      // demo 现由 load 同步预渲染，其内部演示用的示例锚点（如 Menu 导航 demo
      // 里的 #nav-home 菜单项 href）并非真实页面锚点，不应阻断预渲染。
      handleMissingId: 'warn',
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
    },
  },
};
