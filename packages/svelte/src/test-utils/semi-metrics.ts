/**
 * Semi 官网**实测**的关键视觉度量基线。
 *
 * 为什么需要这个：
 * 现有验证（a11y / kbd / 元素存在与数量）**测不出视觉差异**——line-height 差 1px、
 * textarea 少了几行、placeholder 凭空多一句，这些断言全都照样绿。
 * visual project 的截图回归只能发现「相对自己过去变了」，发现不了
 * 「我们从一开始就没和 Semi 对齐」。于是差异只能靠人肉眼看出来，
 * 看漏了或没空看就永久留在代码里。
 *
 * 本文件把 Semi 官网真实 `getComputedStyle` 读数固化成基线，配套
 * `*.metrics.test.ts` 在真实 chromium 里比对本库的计算值，**数值不一致即红**。
 *
 * **取值顺序：源码为准，实测为佐证。**
 *   1. **先读 Semi 源码**（`~/i/semi-design/packages/semi-foundation/<comp>/*.scss` 与
 *      `semi-theme-default/scss/`）拿到**规则/公式**——mixin、变量名、计算式。
 *      源码给的是规则（如 `@include font-size-regular` → 固定 20px 行高），
 *      实测只给某个实例的结果，会被主题/视口/页面级覆盖带偏，也看不出成因。
 *   2. **再打开 Semi 文档页实测** `getComputedStyle` 佐证该规则确实生效；
 *   3. 把值连同 **Semi 源码位置** + 采集日期 + 页面 URL 写进下方常量。
 *
 * 若某项能归纳成「全库通用规则」（如字号↔行高绑定），**优先写成静态闸门**
 * （见 `packages/svelte/scripts/check-font-lineheight.mjs`），比逐个组件钉基线更彻底。
 *
 * ⚠️ 基线是「Semi 当时的真实值」，不是「我们希望的值」。改动本库让某项对不上时，
 * 先确认是本库回归还是 Semi 改版——后者需重新采集并在此注明日期。
 */

export interface MetricBaseline {
  /** 采集自哪个 Semi 页面 */
  source: string;
  /** 采集日期（YYYY-MM-DD） */
  measuredAt: string;
  /** 目标元素在 Semi 侧的选择器（仅作记录，便于复采） */
  semiSelector: string;
  /** 期望的 computed style 键值 */
  computed: Record<string, string>;
}

/** Chat 输入框 textarea —— 实测 semi.design/zh-CN/plus/chat */
export const CHAT_INPUT_TEXTAREA: MetricBaseline = {
  source: 'https://semi.design/zh-CN/plus/chat',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-chat-inputBox-container textarea',
  computed: {
    // 源码依据：Semi input/textarea.scss:158 `@include font-size-regular`，
    // 该 mixin（semi-theme-default/scss/_font.scss:8-12）带**固定 20px 行高**，非 1.5 比例值。
    lineHeight: '20px',
    fontSize: '14px',
    padding: '5px 12px',
    // 初始 4 行（TextArea 默认 rows=4；autosize 只增高不收缩到 minRows）
    height: '90px',
  },
};

/** Chat 输入框外层容器 —— 实测同页 */
export const CHAT_INPUT_CONTAINER: MetricBaseline = {
  source: 'https://semi.design/zh-CN/plus/chat',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-chat-inputBox-container',
  computed: {
    padding: '11px',
    alignItems: 'flex-end',
  },
};

/**
 * AI 多彩标签（colorful）四种形态 —— 实测 semi.design/zh-CN/show/tag。
 *
 * 源码依据：Semi `tag/variables.scss:12-32` 全部指向 AI 色板 ——
 *   solid-bg = `var(--semi-color-ai-purple)`（= ai-purple-5）
 *   solid_gradient-bg = `var(--semi-color-ai-general)`（= ai-general-5，278° 四段）
 *   light-bg = `rgba(var(--semi-ai-purple-0), 1)`
 *   ghost-bg = `var(--semi-color-white)`（**是白底，不是 transparent**）
 *
 * 本库原先是自造的蓝→紫三色（#4d6bff/#7b5cff/#a64dff）+ 120° 三段渐变，
 * **既不同色也不同角度**；AI 色板补齐后改为直接消费，两侧实测已逐字节一致。
 */
export const TAG_COLORFUL_SOLID_GRADIENT: MetricBaseline = {
  source: 'https://semi.design/zh-CN/show/tag',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-tag-colorful.semi-tag-gradient.semi-tag-solid',
  computed: {
    // 278deg 四段：ai-general-5-0..3
    backgroundImage:
      'linear-gradient(278deg, rgb(233, 69, 255) 0%, rgb(166, 71, 255) 30%, rgb(107, 97, 255) 60%, rgb(46, 140, 255) 100%)',
    color: 'rgb(255, 255, 255)',
  },
};

export const TAG_COLORFUL_SOLID: MetricBaseline = {
  source: 'https://semi.design/zh-CN/show/tag',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-tag-colorful.semi-tag-solid:not(.semi-tag-gradient)',
  computed: {
    backgroundColor: 'rgb(166, 71, 255)', // ai-purple-5
    color: 'rgb(255, 255, 255)',
  },
};

export const TAG_COLORFUL_LIGHT: MetricBaseline = {
  source: 'https://semi.design/zh-CN/show/tag',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-tag-colorful.semi-tag-light:not(.semi-tag-gradient)',
  computed: {
    backgroundColor: 'rgb(248, 237, 255)', // ai-purple-0
    color: 'rgb(166, 71, 255)', // ai-purple-5
  },
};

export const TAG_COLORFUL_GHOST: MetricBaseline = {
  source: 'https://semi.design/zh-CN/show/tag',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-tag-colorful.semi-tag-ghost:not(.semi-tag-gradient)',
  computed: {
    backgroundColor: 'rgb(255, 255, 255)', // 白底，非 transparent
    color: 'rgb(166, 71, 255)',
  },
};
