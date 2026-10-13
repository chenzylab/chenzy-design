import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import presetTypography from '@unocss/preset-typography';
import { presetChenzy } from '@chenzy-design/unocss-preset';
import { rehypeBaseLinks, rehypeSemiAnchor } from './rehype-plugins.js';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.md'],
      preprocess: [
        vitePreprocess(),
        // 给 md 渲染出的标题加上与 Semi 一致的锚点 id，供右侧 TOC 跳转、分享链接定位。
        mdsvex({ extensions: ['.md'], rehypePlugins: [rehypeSemiAnchor, rehypeBaseLinks] }),
      ],
      adapter: adapter({ fallback: '404.html' }),
      prerender: {
        entries: ['*'],
        // GitHub Pages 子路径部署时，fallback 404 页内对根 `/` 的引用不应阻断构建。
        handleHttpError: ({ path, message }) => {
          if (path === '/') return;
          throw new Error(message);
        },
        // demo 内部演示用的示例锚点（如 Menu 导航 demo 的 #nav-home）并非真实页面锚点，不应阻断预渲染。
        handleMissingId: 'warn',
      },
      paths: {
        base: (process.env.BASE_PATH ?? '') as '' | `/${string}`,
        // #lib/base 在模块顶层用 resolve('/') 推导 base，相对路径会把首个预渲染页的层级固化进去。
        relative: false,
      },
    }),
    UnoCSS({
      configFile: false,
      presets: [
        presetUno(),
        presetChenzy(),
        // 正文排版：组件文档正文容器加 `prose` 类，typography 只作用于容器内后代，
        // demo 预览区加 `not-prose` 排除（作用域收敛，正文样式够不到 demo 组件）。
        // 采用 preset 默认排版；cssExtend 仅去掉一个明显缺陷：行内 code 的反引号包裹
        //（Tailwind Typography 血统给 code::before/::after 注入 `，观感差且非本站需要）。
        presetTypography({
          cssExtend: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        }),
        // 纯 class 图标路径：<span class="i-lucide-*" />。
        // 图标数据来自本地 @iconify-json/* 包（离线、可 prerender），
        // 追加其它图标集只需装对应 @iconify-json/<collection> 并用 i-<collection>-* 前缀。
        presetIcons({
          scale: 1.2,
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
  ],
});
