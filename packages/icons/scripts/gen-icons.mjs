#!/usr/bin/env node
/**
 * Codegen：从本地 Semi 仓库的已生成图标组件 (packages/semi-icons{,-lab}/src/icons/*.tsx)
 * 提取「组件名 + iconType + svg inner JSX」，机械转换为本库 Svelte 格式：
 *   - svgs.ts：每个图标一个 svg 字符串常量（camelCase 名）
 *   - IconXxx.svelte：薄封装 <Icon svg={xxxSvg} type="..." {...rest} />
 *   - index.ts：barrel 导出全部具名图标 + Icon 基座 + svg 常量
 * 主包(colored=false)与 lab 包(colored=true)复用同一逻辑；Semi 源码已区分去色/彩色，
 * 我们直接照搬 svg inner，不自行改色。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const [, , srcIconsDir, outDir] = process.argv;
if (!srcIconsDir || !outDir) {
  console.error('usage: gen-icons.mjs <semi icons/ dir> <out src dir>');
  process.exit(1);
}

// React JSX 驼峰属性 → SVG kebab 属性
const ATTR_MAP = {
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  fillRule: 'fill-rule',
  gradientTransform: 'gradientTransform', // SVG 原生即驼峰，保留
  gradientUnits: 'gradientUnits', // SVG 原生即驼峰，保留
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeWidth: 'stroke-width',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeDasharray: 'stroke-dasharray',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity',
};

/** 提取 <svg ...>INNER</svg> 的 INNER，并做属性/表达式机械转换。 */
function extractInner(tsx) {
  // 取第一个 <svg ...> 到最后一个 </svg>
  const open = tsx.indexOf('<svg');
  const close = tsx.lastIndexOf('</svg>');
  if (open === -1 || close === -1) return null;
  const svgStart = tsx.indexOf('>', open) + 1; // <svg ...> 的收尾 >
  let inner = tsx.slice(svgStart, close);

  // JSX 内联 style 对象 style={{ maskType: 'alpha', ... }} → style="mask-type:alpha;..."
  inner = inner.replace(/style=\{\{([\s\S]*?)\}\}/g, (_, body) => {
    const css = body
      .split(',')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [k, ...vs] = pair.split(':');
        const prop = k.trim().replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
        const val = vs.join(':').trim().replace(/^['"]|['"]$/g, '');
        return `${prop}:${val}`;
      })
      .join(';');
    return `style="${css}"`;
  });
  // JSX 属性名 → kebab
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    inner = inner.replace(new RegExp(`\\b${from}=`, 'g'), `${to}=`);
  }
  // 数字表达式 attr={2.75} → attr="2.75"
  inner = inner.replace(/=\{(-?[\d.]+)\}/g, '="$1"');
  // 布尔/其它简单表达式 attr={true} → 去掉（图标里通常没有）
  inner = inner.replace(/\s+[a-zA-Z-]+=\{(?:true|false)\}/g, '');
  // 去掉 JSX 注释 {/* */}
  inner = inner.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
  // 折叠空白
  inner = inner.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  return inner;
}

/** camelCase：IconArrowUp → arrowUp（svg 常量名）；IconAIBellLevel1 → aiBellLevel1 */
function svgConstName(componentName) {
  const base = componentName.replace(/^Icon/, '');
  return base.charAt(0).toLowerCase() + base.slice(1) + 'Svg';
}

const files = readdirSync(srcIconsDir).filter((f) => f.endsWith('.tsx'));
const entries = [];
const skippedDynamic = [];
for (const f of files) {
  const componentName = basename(f, '.tsx'); // IconArrowUp
  const tsx = readFileSync(resolve(srcIconsDir, f), 'utf8');
  const typeMatch = tsx.match(/convertIcon\([^,]+,\s*['"]([^'"]+)['"]\)/);
  const iconType = typeMatch ? typeMatch[1] : componentName.replace(/^Icon/, '').toLowerCase();
  const inner = extractInner(tsx);
  if (!inner) {
    console.warn('SKIP (no svg):', f);
    continue;
  }
  // AI 多彩图标含运行时动态表达式（getUuidShort / getFillColor / 渐变 stop）——
  // 无法表达为静态 svg 常量，跳过并记录（不静默截断），作为独立后续项移植。
  if (/=\{/.test(inner)) {
    skippedDynamic.push(componentName);
    continue;
  }
  entries.push({ componentName, iconType, constName: svgConstName(componentName), inner });
}
if (skippedDynamic.length) {
  console.warn(
    `[gen-icons] SKIPPED ${skippedDynamic.length} dynamic (AI multi-color) icons — 需连 utils 单独移植：\n  ` +
      skippedDynamic.join(', '),
  );
}
entries.sort((a, b) => a.componentName.localeCompare(b.componentName));

// —— svgs.ts ——
const svgsHeader = `/**
 * 图标 SVG 路径常量 —— 图形逐一取自 Semi semi-icons(-lab) 源（viewBox 0 0 24 24）。
 * 由 scratchpad/gen-icons.mjs 从 Semi 已生成组件机械转换（JSX 驼峰属性→SVG kebab，
 * 数字表达式→字符串），主包为 currentColor 去色版、lab 包为彩色版（Semi 源已区分）。
 * 请勿手改；重生成见脚本。
 */

/** 统一包裹：24×24 viewBox；宽高由 Icon 基座 font-size 经 1em 控制。 */
const wrap = (inner: string): string =>
  \`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">\${inner}</svg>\`;
`;
const svgsBody = entries
  .map((e) => `\nexport const ${e.constName} = wrap(\n  ${JSON.stringify(e.inner)},\n);`)
  .join('\n');
writeFileSync(resolve(outDir, 'svgs.ts'), svgsHeader + svgsBody + '\n');

// —— IconXxx.svelte ×N ——
const colored = /icons-lab/.test(srcIconsDir);
const fillProp = colored ? '' : '\n    fill?: string;';
for (const e of entries) {
  const comp = `<!-- ${e.componentName} — 具名图标，对齐 Semi ${e.componentName}（convertIcon(${e.iconType}, '${e.iconType}')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ${e.constName} } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;${fillProp}
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={${e.constName}} type="${e.iconType}" {...rest} />
`;
  writeFileSync(resolve(outDir, `${e.componentName}.svelte`), comp);
}

// —— index.ts ——
const kind = colored
  ? '@chenzy-design/icons-lab —— 彩色图标集，对齐 Semi @douyinfe/semi-icons-lab（自带色、不可改色）'
  : '@chenzy-design/icons —— 图标集，对齐 Semi @douyinfe/semi-icons（线性/面性，随 color 变色）';
const idxHeader = `/**
 * ${kind}
 * 具名图标用法同 Semi：\`import { ${entries[0].componentName} } from '...'\` → \`<${entries[0].componentName} />\`。
 * 本文件由 scratchpad/gen-icons.mjs 生成，请勿手改。
 */
export { default as Icon, type IconSize } from './Icon.svelte';
`;
const idxComps = entries
  .map((e) => `export { default as ${e.componentName} } from './${e.componentName}.svelte';`)
  .join('\n');
const idxSvgs =
  '\nexport {\n' + entries.map((e) => `  ${e.constName},`).join('\n') + "\n} from './svgs.js';\n";
writeFileSync(resolve(outDir, 'index.ts'), idxHeader + '\n' + idxComps + '\n' + idxSvgs);

console.log(`[gen-icons] ${entries.length} icons → ${outDir} (colored=${colored})`);
