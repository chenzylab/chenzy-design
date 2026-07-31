/**
 * Semi 变量 ↔ 本库 token 对等闸门（名 / 值 / 公式三者都要对上）。
 *
 * 规则（长期机制）：
 *   Semi 有的变量，本库要有**同名同值同形式**的 token；
 *   - Semi 写死值   → 本库也写死同值
 *   - Semi 引用别的变量（`$spacing-tight` / `var(--semi-color-text-0)`）
 *                   → 本库也要引用**对应的**变量，而不是把结果算死
 *   - Semi 用计算式 → 本库用同结构 calc()
 *   缺的新增，错的修正。
 *
 * 命名映射（Semi → 本库，按本库既有 token 实测归纳）：
 *   `$color-checkbox_label-text-default`   →  `--cd-color-checkbox-label-text-default`
 *   `$color-checkbox_cardType-bg-hover`    →  `--cd-color-checkbox-cardtype-bg-hover`
 *   `$font-checkbox_label-lineHeight`      →  `--cd-font-checkbox-label-lineheight`
 *   即：去掉前导 `$`，`_` → `-`，**驼峰整体小写但不拆词**（cardType→cardtype、
 *   lineHeight→lineheight），加 `--cd-` 前缀。
 *
 * 值映射：
 *   `var(--semi-x)` → `var(--cd-x)`；`$spacing-tight` → `var(--cd-spacing-tight)`。
 *
 * 用法：node packages/tokens/scripts/check-semi-variable-parity.mjs [组件名...]
 *   不带参数=全量；带参数只查指定组件（如 checkbox aiChatInput）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SEMI_FOUNDATION = path.resolve(process.env.HOME ?? '', 'i/semi-design/packages/semi-foundation');
const MANIFEST = path.resolve(HERE, '../dist/token-manifest.json');

if (!fs.existsSync(SEMI_FOUNDATION)) {
  console.error(`找不到 Semi 源码：${SEMI_FOUNDATION}`);
  console.error('本闸门需要本地 Semi 仓库（~/i/semi-design）。');
  process.exit(2);
}

/** Semi 变量名 → 本库 token 名。 */
export function semiVarToToken(semiName) {
  const body = semiName.replace(/^\$/, '');
  // 本库约定：`_` 转 `-`，驼峰**整体小写不拆词**（cardType→cardtype、lineHeight→lineheight）
  const kebab = body.replace(/_/g, '-').toLowerCase();
  return `--cd-${kebab}`;
}

/**
 * Semi 值 → 本库等价值。
 *
 * ⚠️ 关键的**格式差异（非语义差异）**：Semi 的色板变量存的是**裸 RGB 三元组**
 * （`--semi-grey-9: 28,31,35`，见 semi-theme-default/scss/_palette.scss:52），
 * 所以 Semi 必须写 `rgba(var(--semi-grey-9), 1)` 才能拼成颜色；
 * 本库 `--cd-color-grey-9` 本身就是完整颜色，等价写法是 `var(--cd-color-grey-9)`。
 * 因此：
 *   `rgba(var(--semi-X), 1)`  ≡  `var(--cd-color-X)`
 *   `rgba(var(--semi-X), .8)` ≡  `color-mix(in srgb, var(--cd-color-X) 80%, transparent)`
 * 这不是「没对齐」，是两边色板形态不同导致的必然写法差异，比对时须归一。
 */
export function normalizeSemiValue(raw) {
  let v = raw.trim();

  // rgba(var(--semi-X), 1) → var(--cd-color-X)
  v = v.replace(/rgba\(\s*var\(--semi-([a-zA-Z0-9-]+)\)\s*,\s*1\s*\)/g, (_, n) => `var(--cd-color-${n})`);
  // rgba(var(--semi-X), .8) → color-mix(in srgb, var(--cd-color-X) 80%, transparent)
  v = v.replace(
    /rgba\(\s*var\(--semi-([a-zA-Z0-9-]+)\)\s*,\s*(0?\.\d+)\s*\)/g,
    (_, n, a) => `color-mix(in srgb, var(--cd-color-${n}) ${Math.round(parseFloat(a) * 100)}%, transparent)`,
  );

  v = v
    .replace(/var\(\s*--semi-([a-zA-Z0-9-]+)\s*\)/g, (_, n) => `var(--cd-${n})`)
    .replace(/\$([a-zA-Z0-9_-]+)/g, (_, n) => `var(${semiVarToToken('$' + n)})`)
    .replace(/\s+/g, ' ')
    .trim();

  // SCSS 原生支持算术，CSS 必须用 calc()。Semi 写 `($a - 20px) * 0.5`，
  // 本库等价写法就是 `calc((var(--cd-a) - 20px) * 0.5)` —— 同结构，非差异。
  if (/[-+*/]/.test(v) && /var\(/.test(v) && !v.startsWith('calc(')) {
    // 仅当确实是算术表达式（含运算符且非单纯 var/函数调用）时包 calc
    const withoutFns = v.replace(/[a-z-]+\([^()]*\)/g, '');
    if (/[-+*/]/.test(withoutFns)) v = `calc(${v})`;
  }

  return v;
}

/** 解析一个 Semi variables.scss。 */
function parseSemiVariables(file) {
  const out = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(\$[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/);
    if (!m) continue;
    out.push({ semiName: m[1], semiValue: m[2].trim() });
  }
  return out;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byName = new Map(manifest.tokens.map((t) => [t.name, t]));

const only = process.argv.slice(2);
const missing = [];
const mismatched = [];
let checked = 0;

for (const dir of fs.readdirSync(SEMI_FOUNDATION)) {
  if (only.length && !only.includes(dir)) continue;
  const varFile = path.join(SEMI_FOUNDATION, dir, 'variables.scss');
  if (!fs.existsSync(varFile)) continue;

  for (const { semiName, semiValue } of parseSemiVariables(varFile)) {
    checked += 1;
    const tokenName = semiVarToToken(semiName);
    const token = byName.get(tokenName);
    if (!token) {
      missing.push({ comp: dir, semiName, semiValue, expect: tokenName });
      continue;
    }
    const want = normalizeSemiValue(semiValue);
    const got = String(token.value).replace(/\s+/g, ' ').trim();
    if (want !== got) {
      mismatched.push({ comp: dir, semiName, want, got, tokenName });
    }
  }
}

console.log(`比对 Semi 变量 ${checked} 条（${only.length ? only.join(',') : '全部组件'}）`);
console.log(`  缺失（本库无同名 token）：${missing.length}`);
console.log(`  值/公式不一致：${mismatched.length}`);

if (missing.length) {
  console.log('\n—— 缺失（应新增）——');
  for (const x of missing.slice(0, Number(process.env.LIMIT ?? 40))) {
    console.log(`  [${x.comp}] ${x.semiName}: ${x.semiValue}`);
    console.log(`      期望 token: ${x.expect}`);
  }
  if (missing.length > Number(process.env.LIMIT ?? 40)) console.log(`  …另有 ${missing.length - Number(process.env.LIMIT ?? 40)} 条`);
}

if (mismatched.length) {
  console.log('\n—— 值/公式不一致（应修正）——');
  for (const x of mismatched.slice(0, Number(process.env.LIMIT ?? 40))) {
    console.log(`  [${x.comp}] ${x.tokenName}`);
    console.log(`      Semi: ${x.want}`);
    console.log(`      本库: ${x.got}`);
  }
  if (mismatched.length > Number(process.env.LIMIT ?? 40)) console.log(`  …另有 ${mismatched.length - Number(process.env.LIMIT ?? 40)} 条`);
}

if (!missing.length && !mismatched.length) {
  console.log('\n✅ 名/值/公式全部对齐');
}
