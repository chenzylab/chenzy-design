import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

// —— 标题锚点 id：逐字节对齐 Semi 的 makeAnchorId（src/utils/index.js），
// 使 #基本写法 这类分享链接锚点与 Semi 官网完全一致 ——
// 规则：小写 → 删 / → 空格转 - → () 转 aaa → . 转 - → & 转 - → 首字符非中文/字母/% 时前置 n。
function makeAnchorId(id) {
  if (!id) return null;
  return id
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/\s/g, '-')
    .replace(/(\(|\))/g, 'aaa')
    .replace(/\./g, '-')
    .replace(/&/g, '-')
    .replace(/(^[^一-龥^a-z%])/, 'n$1');
}

// 自定义 rehype 插件：给 h1~h6 加上与 Semi 一致的 id（提取标题纯文本 → makeAnchorId）。
function rehypeSemiAnchor() {
  const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const textOf = (node) => {
    if (node.type === 'text') return node.value;
    if (node.children) return node.children.map(textOf).join('');
    return '';
  };
  const visit = (node) => {
    if (node.type === 'element' && HEADINGS.has(node.tagName)) {
      const id = makeAnchorId(textOf(node));
      if (id) {
        node.properties = node.properties || {};
        if (!node.properties.id) node.properties.id = id;
      }
    }
    if (node.children) node.children.forEach(visit);
  };
  return (tree) => visit(tree);
}

export default {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    // 给 md 渲染出的标题加上与 Semi 一致的锚点 id，供右侧 TOC 跳转、分享链接定位。
    // 对纯正文页无副作用，仅多出 id 属性。
    mdsvex({ extensions: ['.md'], rehypePlugins: [rehypeSemiAnchor] }),
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
