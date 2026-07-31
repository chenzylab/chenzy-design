/**
 * Semi 变量 ↔ 本库 token 对等闸门（名 / 值 / 公式三者都要对上）。
 *
 * ## 口径：只比对「运行时契约」，不比对 SCSS 内部变量
 *
 * ⚠️ 本脚本最初的口径是错的，已于 2026-07-31 修正。原先拿
 * `semi-foundation/<comp>/variables.scss` 共 3678 条逐条要求本库建同名 token，
 * 报出「缺失 2058 条」——**其中绝大多数是伪缺口**。
 *
 * 实测证据（Semi 官网 checkbox 页 + 其生产 CSS）：
 *   - 生产 CSS 805 KB 里 `--semi-*` **组件级变量出现 0 次**；
 *   - `$font-checkbox_label-lineHeight: 20px` 编译产物是字面量 `line-height:20px`，
 *     不是 `var(--semi-font-checkbox-label-lineheight)`；
 *   - 页面根作用域实测：`--semi-color-primary` / `--semi-grey-9` **有值**，
 *     而 `--semi-color-checkbox-label-text-default` **无值**。
 *
 * 即：各组件 `semi-foundation/<组件>/variables.scss` 里 3359 条带下划线的变量
 * 是 **SCSS 编译期常量**，
 * 编译后就地展开、不进运行时，外部**无法**通过 CSS 变量覆盖它们。
 * 要求本库为它们各建一个 `--cd-*` CSS 变量，等于凭空造出 Semi 并不存在的契约。
 *
 * 真正的运行时契约是 `semi-theme-default/scss/` 两份：
 *   - `_palette.scss`（444 条）：色板，值为**裸 RGB 三元组**（`--semi-grey-9: 28,31,35`）
 *   - `global.scss`（238 条）：语义色/尺寸，指向色板或字面量
 * 这些才是 Semi 真的输出到浏览器、用户真的能覆盖的变量 —— 本闸门只比对它们。
 *
 * 本库组件 token（`--cd-color-checkbox-*` 等）属于**本库自己的额外能力**
 * （Semi 编译期写死的，本库允许运行时定制），是超集不是缺口，故不参与比对。
 *
 * ## 命名映射（Semi → 本库）
 *   `--semi-color-primary`  → `--cd-color-primary`
 *   `--semi-grey-9`         → `--cd-color-grey-9`（本库色板统一带 color- 段）
 *
 * ## 值映射（两类形态差异，必须归一，不算差异）
 *   1. 色板形态：Semi 存裸三元组故须 `rgba(var(--semi-grey-9), 1)`；
 *      本库 `--cd-color-grey-9` 本身是完整颜色 → `var(--cd-color-grey-9)` 等价。
 *      带透明度的 `rgba(var(--semi-X), .8)`
 *      ≡ `color-mix(in srgb, var(--cd-color-X) 80%, transparent)`。
 *   2. 算术形态：SCSS 原生算术 vs CSS 必须 `calc()`。
 *
 * 用法：node packages/tokens/scripts/check-semi-variable-parity.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SEMI_THEME = path.resolve(
  process.env.HOME ?? '',
  'i/semi-design/packages/semi-theme-default/scss',
);
const MANIFEST = path.resolve(HERE, '../dist/token-manifest.json');

if (!fs.existsSync(SEMI_THEME)) {
  console.error(`找不到 Semi 主题源码：${SEMI_THEME}`);
  console.error('本闸门需要本地 Semi 仓库（~/i/semi-design）。');
  process.exit(2);
}

/** Semi CSS 变量名 → 本库 token 名。 */
export function semiVarToToken(semiName) {
  const body = semiName.replace(/^--semi-/, '');
  // 本库色板统一带 color- 段：--semi-grey-9 → --cd-color-grey-9。
  // 语义变量本就以 color-/spacing-/… 开头，不重复加。
  const needsColorPrefix = /^(?!color-|spacing-|width-|height-|border-|shadow-|font-|z-|transition-|transform-|opacity-|animation-)/.test(
    body,
  );
  return `--cd-${needsColorPrefix ? 'color-' : ''}${body}`;
}

/**
 * 颜色字面量归一：把各种写法折算成 `r,g,b` 或 `r,g,b,a` 供比对。
 *
 * ⚠️ 色板层必须做这一步：Semi 存的是**裸三元组**（`--semi-blue-5: 0,100,250`，
 * 因为它要用 `rgba(var(--semi-blue-5), .8)` 拼透明度），本库存的是完整颜色
 * （`--cd-color-blue-5: #0064fa`）。两者是同一个颜色的不同记法，**不是值不一致**。
 * 不归一会让整个色板 200+ 条全部误报。
 */
function canonicalColor(s) {
  const v = s.trim().toLowerCase();

  // 裸三元组 / 四元组：0,100,250
  const bare = v.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?$/);
  if (bare) {
    const [, r, g, b, a] = bare;
    return a !== undefined && Number(a) !== 1 ? `${+r},${+g},${+b},${+a}` : `${+r},${+g},${+b}`;
  }

  // #rgb / #rrggbb / #rrggbbaa
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (h.length === 6) return `${r},${g},${b}`;
      const a = Math.round((parseInt(h.slice(6, 8), 16) / 255) * 1000) / 1000;
      return a === 1 ? `${r},${g},${b}` : `${r},${g},${b},${a}`;
    }
  }

  // rgb()/rgba() 字面量（不含 var()）
  const fn = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (fn) {
    const [, r, g, b, a] = fn;
    return a !== undefined && Number(a) !== 1 ? `${+r},${+g},${+b},${+a}` : `${+r},${+g},${+b}`;
  }

  return null;
}

/**
 * Semi 值 → 本库等价值（归一两类形态差异，见文件头）。
 */
export function normalizeSemiValue(raw) {
  let v = raw.trim();

  // rgba(var(--semi-X), 1) → var(--cd-color-X)；无 alpha 的 rgba(var(--semi-X)) 同理
  v = v.replace(
    /rgba\(\s*var\(--semi-([a-zA-Z0-9-]+)\)\s*(?:,\s*1\s*)?\)/g,
    (_, n) => `var(--cd-color-${n})`,
  );
  // rgba(var(--semi-X), .8) → color-mix(...)
  v = v.replace(
    /rgba\(\s*var\(--semi-([a-zA-Z0-9-]+)\)\s*,\s*(0?\.\d+)\s*\)/g,
    (_, n, a) =>
      `color-mix(in srgb, var(--cd-color-${n}) ${Math.round(parseFloat(a) * 100)}%, transparent)`,
  );

  v = v
    .replace(/var\(\s*--semi-([a-zA-Z0-9-]+)\s*\)/g, (_, n) => `var(${semiVarToToken(`--semi-${n}`)})`)
    .replace(/\s+/g, ' ')
    .trim();

  // SCSS 原生算术 → CSS 必须 calc()。但要先剔除**函数调用整体**再判断，
  // 否则 color-mix(in srgb, ... 35%, transparent) 里的 `-`/`%` 会被误当算术而白包一层 calc。
  if (/var\(/.test(v) && !v.startsWith('calc(')) {
    let stripped = v;
    // 反复剥掉最内层函数调用，直到没有括号（处理 color-mix(… var(…) …) 这种嵌套）
    for (let i = 0; i < 10 && /\([^()]*\)/.test(stripped); i += 1) {
      stripped = stripped.replace(/[a-z-]*\([^()]*\)/g, '');
    }
    if (/[-+*/]/.test(stripped)) v = `calc(${v})`;
  }

  return v;
}

/**
 * 解析 Semi 主题 scss，按 light / dark 两个作用域分别收集。
 * 作用域判定：`body[theme-mode="dark"]` 起为 dark，其余为 light。
 */
function parseThemeFile(file) {
  const light = new Map();
  const dark = new Map();
  let bucket = light;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/^\s*body\[theme-mode="dark"\]/.test(line)) bucket = dark;
    else if (/^\s*(body|:host)[,\s{]/.test(line) && !/dark/.test(line)) bucket = light;

    const m = line.match(/^\s*(--semi-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
    if (!m) continue;
    // 后定义覆盖先定义（对齐 CSS 层叠语义，也如实反映 Semi 内部的重复定义）
    bucket.set(m[1], m[2].trim());
  }
  return { light, dark };
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byName = new Map(manifest.tokens.map((t) => [t.name, t]));

const files = ['_palette.scss', 'global.scss'];
const semiLight = new Map();
for (const f of files) {
  const { light } = parseThemeFile(path.join(SEMI_THEME, f));
  for (const [k, v] of light) semiLight.set(k, v);
}

/**
 * 已核实的例外 —— 每条都必须写清「为什么这不是缺陷」。
 * 空对象即无例外；新增前先确认不是在给真问题开后门。
 */
const EXCEPTIONS = {
  // Semi 的 --semi-white / --semi-black 是**色板裸三元组**，故语义层要写
  // rgba(var(--semi-white), 1) 拼成颜色。本库 --cd-color-white 本身就是完整颜色、
  // 且它就是色板那一条，再指向自己会形成自引用死循环。属色板形态差异，非值差异。
  '--cd-color-white': '本库色板存完整颜色，Semi 存裸三元组；自引用会成环',
  '--cd-color-black': '同上',
  // Semi 上游 bug：global.scss:143/272 把「激活态」也命名成 -hover（注释写明是激活态），
  // 于是激活值覆盖了悬浮值、hover 档在 Semi 里实际取不到正确色。
  // 本库按注释语义拆成 -hover / -active 两档，此处 hover 保留的是 Semi 注释所指的悬浮值。
  '--cd-color-ai-background-top-hover':
    'Semi 上游重复定义致 hover 被 active 覆盖；本库按其注释拆两档，见 alias/index.ts',
};

const missing = [];
const mismatched = [];
const excepted = [];

for (const [semiName, semiValue] of semiLight) {
  const tokenName = semiVarToToken(semiName);
  const token = byName.get(tokenName);
  if (!token) {
    missing.push({ semiName, semiValue, expect: tokenName });
    continue;
  }
  const want = normalizeSemiValue(semiValue);
  const got = String(token.value).replace(/\s+/g, ' ').trim();
  if (want === got) continue;

  // 逗号/括号周围的空格是纯排版差异（`rgba(0,0,0,.3)` vs `rgba(0, 0, 0, .3)`），不算值差异
  const squash = (s) => s.replace(/\s*([,()])\s*/g, '$1');
  if (squash(want) === squash(got)) continue;

  // 颜色字面量：先折算成规范形态再比（裸三元组 vs hex 是记法差异，非值差异）
  const cw = canonicalColor(want);
  const cg = canonicalColor(got);
  if (cw && cg && cw === cg) continue;

  if (EXCEPTIONS[tokenName]) {
    excepted.push({ tokenName, why: EXCEPTIONS[tokenName] });
    continue;
  }

  mismatched.push({ semiName, tokenName, want, got });
}

console.log(`比对 Semi 运行时变量 ${semiLight.size} 条（_palette.scss + global.scss，light 主题）`);
console.log(`  缺失（本库无对应 token）：${missing.length}`);
console.log(`  值/公式不一致：${mismatched.length}`);
if (excepted.length) {
  console.log(`  已核实例外：${excepted.length}`);
  for (const e of excepted) console.log(`    ${e.tokenName} —— ${e.why}`);
}

const LIMIT = Number(process.env.LIMIT ?? 40);

if (missing.length) {
  console.log('\n—— 缺失（应新增）——');
  for (const x of missing.slice(0, LIMIT)) {
    console.log(`  ${x.semiName}: ${x.semiValue}`);
    console.log(`      期望 token: ${x.expect}`);
  }
  if (missing.length > LIMIT) console.log(`  …另有 ${missing.length - LIMIT} 条`);
}

if (mismatched.length) {
  console.log('\n—— 值/公式不一致（应修正）——');
  for (const x of mismatched.slice(0, LIMIT)) {
    console.log(`  ${x.tokenName}`);
    console.log(`      Semi: ${x.want}`);
    console.log(`      本库: ${x.got}`);
  }
  if (mismatched.length > LIMIT) console.log(`  …另有 ${mismatched.length - LIMIT} 条`);
}

if (!missing.length && !mismatched.length) {
  console.log('\n✅ Semi 运行时变量的名/值/公式全部对齐');
} else {
  process.exitCode = 1;
}
