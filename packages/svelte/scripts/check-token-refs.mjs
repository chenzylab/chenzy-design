#!/usr/bin/env node
/**
 * 闸门：组件样式里 `var(--cd-*)` 引用的 token 必须真实存在于 tokens.css。
 *
 * 为什么需要：token 名写错/改名后漏改消费方时，`var()` 取不到值是**完全静默的**——
 * 不报错、typecheck 不管、单测也照过，只是那条样式失效（有兜底值时更隐蔽，
 * 会悄悄用兜底而不是设计值）。
 *
 * 真实案例（2026-08-01 本闸门首次扫出）：
 *   · --cd-font-size-secondary 从未定义过，SideBar 里 4 处无兜底引用直接失效，
 *     字号回落到浏览器默认 16px（本应是 12px）；另有 6 处带兜底，一直悄悄用 regular。
 *
 * 判定口径：
 *   · 只查 `.svelte` 的 <style> 块与内联 style 里的 var(--cd-*)。
 *   · 带兜底的 `var(--x, fallback)` **同样报**——兜底掩盖的是「这个 token 名是错的」，
 *     不是「设计上允许缺失」。
 *   · 忽略 var(--cd-...) 出现在注释里的情况。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const TOKENS_CSS = path.join(ROOT, 'packages/tokens/dist/tokens.css');
const SRC = path.join(ROOT, 'packages/svelte/src');

if (!fs.existsSync(TOKENS_CSS)) {
  console.error('✗ 未找到 packages/tokens/dist/tokens.css —— 请先 pnpm --filter @chenzy-design/tokens build');
  process.exit(1);
}

const css = fs.readFileSync(TOKENS_CSS, 'utf8');
const defined = new Set([...css.matchAll(/^\s*(--cd-[a-zA-Z0-9-]+)\s*:/gm)].map((m) => m[1]));

/** 递归收集 .svelte 文件。 */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__screenshots__') continue;
      out.push(...walk(p));
    } else if (entry.name.endsWith('.svelte')) {
      out.push(p);
    }
  }
  return out;
}

/** 去掉 CSS 注释与 HTML 注释，避免注释里的示例被误判。 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * 收集「组件运行时自己设的 CSS 变量」——它们由 style= 或 setProperty 动态赋值，
 * 不是设计 token，本来就不该出现在 tokens.css 里。
 * 判定法：同一个包里存在「非 var() 形式」的 `--cd-xxx:` 赋值（内联 style 字符串或
 * setProperty 调用）。这样不必维护白名单，新增运行时变量自动被认出来。
 */
function collectRuntimeVars() {
  const runtime = new Set();
  for (const file of walk(SRC)) {
    const src = fs.readFileSync(file, 'utf8');
    // `--cd-x:${expr}` / '--cd-x:' + v / setProperty('--cd-x', v)
    for (const m of src.matchAll(/`[^`]*?(--cd-[a-zA-Z0-9-]+)\s*:/g)) runtime.add(m[1]);
    for (const m of src.matchAll(/setProperty\(\s*['"`](--cd-[a-zA-Z0-9-]+)/g)) runtime.add(m[1]);
  }
  return runtime;
}
const runtimeVars = collectRuntimeVars();

const bad = new Map();
for (const file of walk(SRC)) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  for (const m of src.matchAll(/var\(\s*(--cd-[a-zA-Z0-9-]+)/g)) {
    if (defined.has(m[1]) || runtimeVars.has(m[1])) continue;
    const rel = path.relative(ROOT, file);
    if (!bad.has(m[1])) bad.set(m[1], new Set());
    bad.get(m[1]).add(rel);
  }
}

/**
 * 历史遗留：这 7 个都写了兜底值（`var(--x, 20px)`），视觉没坏，只是走的一直是兜底而非
 * 设计 token —— 主题/DSM 改不动它们。属既有欠债，与本次改动无关，逐个核对 Semi 后再修。
 * **无兜底的一律直接红**（那种是真失效），故这里只豁免带兜底的具体名字，不是整类放行。
 */
const KNOWN_DEBT = new Set([
  '--cd-dropdown-motion-duration',
  '--cd-dropdown-motion-easing',
  '--cd-font-size-header',
  '--cd-line-height-normal',
  '--cd-radius-small',
  '--cd-width-cascader-icon',
  '--cd-width-cascader-option-icon',
]);

const fresh = [...bad].filter(([t]) => !KNOWN_DEBT.has(t));
const debt = [...bad].filter(([t]) => KNOWN_DEBT.has(t));

if (fresh.length === 0) {
  console.log(`✅ 组件里的 var(--cd-*) 引用全部有定义（比对 ${defined.size} 条 token）`);
  if (debt.length > 0) {
    console.log(`   （另有 ${debt.length} 个历史遗留项带兜底值，已登记在 KNOWN_DEBT，待逐个核对 Semi）`);
  }
  process.exit(0);
}

console.error(`✗ 发现 ${fresh.length} 个未定义的 token 引用：\n`);
for (const [token, files] of fresh.sort()) {
  console.error(`  ${token}`);
  for (const f of files) console.error(`      ${f}`);
}
console.error('\n这些 var() 取不到值会静默失效（带兜底的则悄悄用兜底值）。');
console.error('修法：改指真实存在的 token 名，或在 packages/tokens/src/components/ 里补上定义。');
process.exit(1);
