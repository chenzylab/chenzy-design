#!/usr/bin/env node
/**
 * Codegen（AI 多彩图标）：把 Semi 含运行时逻辑的 AI 图标 (getUuidShort/getFillColor/渐变)
 * 转为带 <script> 的 Svelte 组件。表达式（fill={primaryColor}、fill={`url(#${id})`}、
 * stopColor={stop1}）在 Svelte 中语法兼容，直接保留；仅转 JSX 驼峰属性名→SVG kebab、
 * 去掉 {...rest} 的 JSX 位置换为 Svelte {...rest}、数字表达式 x1={21.99}→x1="21.99"。
 * 运行时 Math.random 生成 gradient id 与 Semi 一致（浏览器组件，非构建脚本）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , srcIconsDir, outDir, listCsv] = process.argv;
const names = listCsv.split(',').map((s) => s.trim()).filter(Boolean);

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
  fillOpacity: 'fill-opacity',
};

function jsxToSvelte(svg) {
  let s = svg;
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    s = s.replace(new RegExp(`\\b${from}=`, 'g'), `${to}=`);
  }
  // width/height 数字或字符串保留；纯数字表达式 attr={12.3} → attr="12.3"
  s = s.replace(/=\{(-?[\d.]+)\}/g, '="$1"');
  // focusable={false} aria-hidden={true} → 布尔属性
  s = s.replace(/\s+focusable=\{false\}/g, ' focusable="false"');
  s = s.replace(/\s+aria-hidden=\{true\}/g, ' aria-hidden="true"');
  // {...rest} JSX 展开 → Svelte {...rest}（语法一致，无需改）
  return s;
}

const generated = [];
for (const name of names) {
  const tsx = readFileSync(resolve(srcIconsDir, `${name}.tsx`), 'utf8');
  const iconType = (tsx.match(/convertIcon\([^,]+,\s*['"]([^'"]+)['"]\)/) || [])[1] || '';

  // 提取 SvgComponent 函数体里的前导变量声明（fill 解构、id、颜色数组解构）
  const fnStart = tsx.indexOf('function SvgComponent');
  const retStart = tsx.indexOf('return (', fnStart);
  const preamble = tsx.slice(tsx.indexOf('{', fnStart) + 1, retStart);

  // getFillColor(fill, N)
  const num = (preamble.match(/getFillColor\(fill,\s*(\d+)\)/) || [])[1];
  // 颜色解构，兼容两种写法：
  //   一步式：const [a, b] = getFillColor(fill, N)
  //   两步式：const arr = getFillColor(fill, N); const [a,b,c,d] = arr;
  let colorVars = [];
  const oneStep = preamble.match(/const\s*\[([^\]]+)\]\s*=\s*getFillColor/);
  if (oneStep) {
    colorVars = oneStep[1].split(',').map((v) => v.trim());
  } else {
    // 找 getFillColor 赋给的中间变量名，再找它的解构
    const mid = (preamble.match(/const\s+(\w+)\s*=\s*getFillColor/) || [])[1];
    if (mid) {
      const twoStep = preamble.match(
        new RegExp(`const\\s*\\[([^\\]]+)\\]\\s*=\\s*${mid}\\b`),
      );
      if (twoStep) colorVars = twoStep[1].split(',').map((v) => v.trim());
    }
  }
  // uuid
  const uuidMatch = preamble.match(/getUuidShort\(\{\s*prefix:\s*'([^']+)'/);
  const uuidPrefix = uuidMatch ? uuidMatch[1] : null;

  // 提取 <svg ...>...</svg> 整段
  const svgOpen = tsx.indexOf('<svg', retStart);
  const svgClose = tsx.lastIndexOf('</svg>') + '</svg>'.length;
  let svg = tsx.slice(svgOpen, svgClose);
  // 去掉 {...rest}（放到 Svelte 组件里由根 <Icon> 透传时不需要；此处直接内联 svg，保留 rest 透传到 svg）
  svg = svg.replace(/\s*\{\.\.\.rest\}/g, ' {...rest}');
  svg = jsxToSvelte(svg);

  // 组装 script
  const imports = [];
  if (num) imports.push('getFillColor');
  if (uuidPrefix) imports.push('getUuidShort');
  const lines = [];
  lines.push('<script lang="ts">');
  lines.push(`  import { ${imports.join(', ')} } from './utils.js';`);
  lines.push('');
  lines.push('  interface Props {');
  lines.push('    /** 多彩填充色：string 或 string[]（缺省用 Semi 默认渐变色）。 */');
  lines.push('    fill?: string | string[];');
  lines.push('    class?: string;');
  lines.push('    style?: string;');
  lines.push('    [key: string]: unknown;');
  lines.push('  }');
  lines.push('  let { fill, ...rest }: Props = $props();');
  lines.push('');
  if (uuidPrefix) lines.push(`  const id = getUuidShort({ prefix: '${uuidPrefix}' });`);
  if (num && colorVars.length) {
    lines.push(`  const [${colorVars.join(', ')}] = $derived.by(() => getFillColor(fill, ${num}));`);
  }
  lines.push('</script>');
  lines.push('');
  lines.push(`<!-- ${name} — AI 多彩图标，对齐 Semi ${name}（type='${iconType}'）。fill 数组自定义多色。 -->`);
  lines.push(svg);
  lines.push('');

  writeFileSync(resolve(outDir, `${name}.svelte`), lines.join('\n'));
  generated.push({ name, iconType });
}

console.log(`[gen-ai-icons] ${generated.length} AI icons → ${outDir}`);
console.log(generated.map((g) => g.name).join(', '));
