#!/usr/bin/env node
/**
 * Codegen：从本地 Semi 仓库的已生成插画组件 (packages/semi-illustrations/src/illustrations/*.tsx)
 * 提取「组件名 + svg inner JSX」，机械转换为本库 Svelte 格式：
 *   - IllustrationXxx.svelte：路径级复刻 Semi 原始插画，200x200，class/style 透传
 *   - index.ts：barrel 导出全部 16 个插画
 * var(--semi-color-primary*) → var(--cd-color-primary*)，其余固定色值原样保留（Semi 源本身即硬编码中性灰）。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const [, , srcDir, outDir] = process.argv;
if (!srcDir || !outDir) {
  console.error('usage: gen-illustrations.mjs <semi-illustrations/src/illustrations dir> <out src dir>');
  process.exit(1);
}

const ATTR_MAP = {
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  fillRule: 'fill-rule',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeWidth: 'stroke-width',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeDasharray: 'stroke-dasharray',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity',
  maskType: 'mask-type',
};

/** 提取 <svg ...>INNER</svg> 的 INNER（跳过最外层 {...props} 之前的固定 attrs），并做属性/表达式机械转换。 */
function extractInner(tsx) {
  const open = tsx.indexOf('<svg');
  const close = tsx.lastIndexOf('</svg>');
  if (open === -1 || close === -1) return null;
  const svgStart = tsx.indexOf('>', tsx.lastIndexOf('{...props}', close)) + 1;
  let inner = tsx.slice(svgStart, close);

  // className="..." 整体删除：Semi 源文件残留的浏览器调试注入标记（如
  // "__web-inspector-hide-shortcut__"），非有意义的视觉内容，React 组件亦未消费此值。
  inner = inner.replace(/\s+className="[^"]*"/g, '');
  // mask-type="alpha" 是合法 SVG 属性，但 svelte-check 对 <mask> 元素的属性类型定义不完整会
  // 误报；改用等价的 style="mask-type:alpha" 规避类型检查噪声，视觉效果不变。
  inner = inner.replace(/\s+mask-type="([^"]*)"/g, ' style="mask-type:$1"');
  // JSX 属性名 → kebab（顺序：长名先替换避免子串冲突，此处均为独立单词，无需特殊排序）
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    inner = inner.replace(new RegExp(`\\b${from}=`, 'g'), `${to}=`);
  }
  // 数字表达式 attr={2.75} → attr="2.75"
  inner = inner.replace(/=\{(-?[\d.]+)\}/g, '="$1"');
  // 布尔表达式 attr={true}/{false} → 去掉
  inner = inner.replace(/\s+[a-zA-Z-]+=\{(?:true|false)\}/g, '');
  // 去掉 JSX 注释
  inner = inner.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
  // Semi token → 本库 token（1:1 同名映射，见 tokens/dist/tokens.css --cd-color-primary*）
  inner = inner.replace(/var\(--semi-color-/g, 'var(--cd-color-');
  // 折叠空白
  inner = inner.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  return inner;
}

const files = readdirSync(srcDir).filter((f) => f.endsWith('.tsx'));
const entries = [];
for (const f of files) {
  const componentName = basename(f, '.tsx'); // IllustrationNoContent
  const tsx = readFileSync(resolve(srcDir, f), 'utf8');
  const inner = extractInner(tsx);
  if (!inner) {
    console.warn('SKIP (no svg):', f);
    continue;
  }
  entries.push({ componentName, inner });
}
entries.sort((a, b) => a.componentName.localeCompare(b.componentName));

for (const e of entries) {
  const svelte = `<!--
  ${e.componentName} — 路径级复刻 Semi @douyinfe/semi-illustrations 的 ${e.componentName}。
  200x200，class/style 透传覆盖尺寸；var(--semi-color-primary*) 已映射为 var(--cd-color-primary*)。
-->
<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
  }
  let { class: className = '', style = '' }: Props = $props();
</script>

<svg
  class={className}
  {style}
  width="200"
  height="200"
  viewBox="0 0 200 200"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  focusable="false"
  aria-hidden="true"
>${e.inner}</svg>
`;
  writeFileSync(resolve(outDir, `${e.componentName}.svelte`), svelte);
}

const indexHeader = `/**
 * @chenzy-design/illustrations —— 路径级复刻 @douyinfe/semi-illustrations 全部 16 个插画。
 * 8 语义 × light/dark，200x200，供 Empty（image / darkModeImage）与业务空态引入。
 */
`;
const indexBody = entries
  .map((e) => `export { default as ${e.componentName} } from './${e.componentName}.svelte';`)
  .join('\n');
writeFileSync(resolve(outDir, 'index.ts'), indexHeader + indexBody + '\n');

console.log(`generated ${entries.length} illustrations -> ${outDir}`);
