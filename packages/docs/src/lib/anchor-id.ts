// 标题锚点 id 生成 —— 逐字节对齐 Semi 的 makeAnchorId（semi-design/src/utils/index.js）。
// 使 #基本写法 这类分享锚点与 Semi 官网完全一致。svelte.config.js 的 rehype 插件和
// +page.svelte 的 hash 定位共用此函数，保证「复制的 hash → 转 id 定位」两端一致。
// 规则：小写 → 删 / → 空格转 - → () 转 aaa → . 转 - → & 转 - → 首字符非中文/字母/% 时前置 n。
export function makeAnchorId(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/\s/g, '-')
    .replace(/(\(|\))/g, 'aaa')
    .replace(/\./g, '-')
    .replace(/&/g, '-')
    .replace(/(^[^一-龥^a-z%])/, 'n$1');
}
