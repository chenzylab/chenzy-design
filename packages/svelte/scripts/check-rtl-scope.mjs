/**
 * RTL 作用域闸门：禁止用 `:dir()` 做方向判定。
 *
 * ## 为什么
 *
 * `:dir()` **只匹配 HTML 的 `dir` 属性**，不认 CSS 的 `direction` 属性。
 * 而本库（与 Semi 一致）的 ConfigProvider 只注入 `<div class="cd-rtl">`，
 * **不设 `dir` 属性** —— 全站 `[dir]` 元素实测为 0。
 *
 * 于是任何写成 `:dir(rtl)` 的规则/判定都是**永不生效的死代码**，
 * 且 typecheck / 单测 / a11y 全绿，只有量真实坐标才看得见。
 * Carousel 就这么把「箭头镜像 / 指示器换边 / 左右键镜像」三件事静默丢了。
 *
 * ## 正确写法
 *
 *   CSS：`:global(.cd-rtl) .cd-<comp> { ... }`（与 Semi rtl.scss 的 `.semi-rtl` 同构）
 *   JS ：`getComputedStyle(el).direction === 'rtl'`（两种机制都认）
 *
 * 若将来 ConfigProvider 改为同时输出 `dir` 属性，可放宽本闸门 —— 但要先确认
 * 所有浮层（Portal 到 body 的那些）也都带上了 dir，否则仍会静默失效。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../src');

/** 允许出现 `:dir(` 的文件（说明理由后加入）。 */
const ALLOW = new Set([
  // 本闸门自身的说明文字不在 src 内，故此处暂无豁免项
]);

const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(svelte|ts)$/.test(entry.name)) continue;
    const rel = path.relative(SRC, p);
    if (ALLOW.has(rel)) continue;

    // 注释里出现 `:dir(` 是在**解释为什么不能用**，不算违规 ——
    // 故须跟踪块注释状态（`/* */`、`<!-- -->`），不能只看行首。
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    let inBlock = false;
    lines.forEach((line, i) => {
      let code = line;

      if (inBlock) {
        const end = code.search(/\*\/|-->/);
        if (end === -1) return; // 整行都在注释里
        code = code.slice(end + 2);
        inBlock = false;
      }
      // 去掉本行内成对出现的块注释
      code = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      // 本行开了块注释但没闭合
      const open = code.search(/\/\*|<!--/);
      if (open !== -1) {
        inBlock = true;
        code = code.slice(0, open);
      }
      // 行注释
      code = code.replace(/\/\/.*$/, '');

      if (/:dir\(/.test(code)) offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 90)}`);
    });
  }
}

walk(SRC);

if (offenders.length) {
  console.error('❌ 发现 `:dir()` 用法 —— 它只认 HTML dir 属性，本库靠 .cd-rtl 类，规则不会生效：\n');
  for (const o of offenders) console.error(`  ${o}`);
  console.error('\n改用 `:global(.cd-rtl) .cd-<comp>`（CSS）或 getComputedStyle(el).direction（JS）。');
  process.exit(1);
}

console.log('✅ 无 `:dir()` 误用（RTL 一律走 .cd-rtl 作用域）');
