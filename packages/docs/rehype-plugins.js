import process from 'node:process';

// —— 标题锚点 id：逐字节对齐 Semi 的 makeAnchorId（src/utils/index.js），
// 使 #基本写法 这类分享链接锚点与 Semi 官网完全一致 ——
// 规则：小写 → 删 / → 空格转 - → () 转 aaa → . 转 - → & 转 - → 首字符非中文/字母/% 时前置 n。
/** @param {string} id */
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

// 自定义 rehype 插件：给 md 正文里的站内绝对链接（如 [Popover](/components/popover)）前置 base 前缀。
// GitHub Pages 子路径部署时 paths.base = /chenzy-design，静态 md 里裸写的 /components/xxx 无法插值 base，
// 会导致运行时点击 404、且预渲染 crawler 直接抛错阻断构建。此处按 BASE_PATH（与 vite.config.ts 中 sveltekit({ paths.base }) 同源）在构建期改写。
// 只改写以 / 开头、非 // 协议相对、非 base 已前缀的站内链接；#锚点、外链、mailto 等不动。
export function rehypeBaseLinks() {
  const base = process.env.BASE_PATH ?? '';
  /** @param {any} tree */
  return (tree) => {
    if (!base) return; // dev / base 为空时无需改写
    /** @param {any} node */
    const visit = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
        const href = String(node.properties.href);
        if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith(base + '/') && href !== base) {
          node.properties.href = base + href;
        }
      }
      if (node.children) node.children.forEach(visit);
    };
    visit(tree);
  };
}

// 自定义 rehype 插件：给 h1~h6 加上与 Semi 一致的 id（提取标题纯文本 → makeAnchorId）。
export function rehypeSemiAnchor() {
  const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  /** @type {(node: any) => string} */
  const textOf = (node) => {
    if (node.type === 'text') return node.value;
    if (node.children) return node.children.map(textOf).join('');
    return '';
  };
  /** @param {any} node */
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
  return (/** @type {any} */ tree) => visit(tree);
}
