/**
 * 字号↔行高绑定对齐 Semi 的静态闸门。
 *
 * 依据（Semi 源码，非实测）：
 *   packages/semi-theme-default/scss/_font.scss 把字号与行高**成对绑定**在 mixin 里，
 *   全库 159 处 `@include font-size-*` 都同时拿到固定 px 行高：
 *     small→16px  regular→20px  header-6→22px  header-5→24px
 *     header-4→28px  header-3→32px  header-2→40px  header-1→44px
 *   本库 tokens 已 1:1 镜像该表（--cd-line-height-*），组件只需消费，不该自己算。
 *
 * ⚠️ **形式也要对齐，不只是数值对齐**：
 *   - Semi 写 `@include font-size-*`（通用刻度）→ 本库用 `--cd-line-height-{scale}`；
 *   - Semi 写组件专属变量（如 `$font-checkbox_label-lineHeight`）
 *     → 本库必须用**同名同值的组件专属 token**（`--cd-font-checkbox-label-lineheight`），
 *       **不能**图省事借用通用刻度 token —— 那样主题定制时改不动这一处，
 *       且丢掉了「这是组件自己的可调参数」这层语义。
 *   - Semi 写死 px → 本库也写死同值 px（如代码块 `1.5`，见 ALLOWED 白名单）。
 *
 * 为什么要这个闸门：
 *   写 `line-height: 1.5` 看着"合理"，14px 字号下却算出 21px，比 Semi 多 1px；
 *   多行累积后整块高度就偏了（实测 Semi 4 行 90px vs 本库 94px），
 *   而 a11y / kbd / 计数类断言**全都照样绿**，只能靠人肉眼发现。
 *
 * 例外白名单：Semi 源码里确实写死 `1.5` 的地方（代码块等宽字体场景）。
 * 新增例外必须注明 Semi 源码位置。
 *
 * 用法：node packages/svelte/scripts/check-font-lineheight.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

/** Semi 源码里确实用比例值 1.5 的位置（逐条注明依据）。 */
const ALLOWED = [
  {
    file: 'code-highlight/CodeHighlight.svelte',
    why: 'Semi codeHighlight.scss:25 原样 line-height: 1.5（Prism 代码块等宽字体）',
  },
  {
    file: 'input/TextArea.svelte',
    why: 'Semi input/textarea.scss:282,314 行号列/行号变体原样 line-height: 1.5（等宽字体对齐）',
  },
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith('.svelte')) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    // 只抓「无单位比例值」写法：line-height: 1.5 / 1.4 / 1.6 等
    const m = line.match(/^\s*line-height:\s*([0-9]*\.?[0-9]+)\s*;/);
    if (!m) return;
    if (ALLOWED.some((a) => a.file === rel)) return;
    const value = parseFloat(m[1]);
    // `line-height: 0` / `1` 是图标·字形居中的排版重置，与字号无关、不参与多行文本排版：
    //   - Semi 也用 `line-height: 0`（tree.scss:402 / upload.scss:267 / videoPlayer.scss:21
    //     / cascader.scss:484，注释均为 "make the spin icon in the center"）；
    //   - `1` 同源意图，本库用在 flex 居中的图标/单字形容器（箭头按钮、评分字符、
    //     步骤序号、开关文字、序号徽标等）上。
    // 这类不属于「字号↔行高绑定」的适用范围，放行。
    if (value === 0 || value === 1) return;
    problems.push({ file: rel, line: i + 1, value: m[1] });
  });
}

if (!problems.length) {
  console.log('✅ 字号↔行高绑定全部对齐 Semi（无裸比例行高）');
} else {
  console.error(`❌ ${problems.length} 处行高用了比例值，应改用 --cd-line-height-* token：\n`);
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  line-height: ${p.value}`);
  }
  console.error(
    '\nSemi 的字号与行高是成对绑定的固定 px（small16/regular20/h6-22/h5-24/h4-28/h3-32/h2-40/h1-44），',
  );
  console.error('本库 tokens 已镜像该表。请按该元素的字号改用对应的 --cd-line-height-* 变量。');
  console.error('若 Semi 源码此处确实写 1.5，请加进脚本的 ALLOWED 白名单并注明 Semi 源码位置。');
  process.exit(1);
}
