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
  measuredAt: '2026-08-06',
  semiSelector: '.semi-chat-inputBox-container textarea',
  computed: {
    // 源码依据：Semi input/textarea.scss:158 `@include font-size-regular`，
    // 该 mixin（semi-theme-default/scss/_font.scss:8-12）带**固定 20px 行高**，非 1.5 比例值。
    lineHeight: '20px',
    fontSize: '14px',
    padding: '5px 12px',
    // 初始 minRows:1 单行（chat/inputBox/index.tsx 传 autosize={{minRows:1,maxRows:5}}，
    // Semi calculateNodeHeight 用 minRows 求初始高度，非 rows 默认值 4）：
    // 1×20 行高 + 10 纵向 padding = 30px。真机截图核实（用户提供 Semi 官网截图为紧凑单行）。
    // 前一版「90px/4行」是本库 TextArea autosize 测量被原生 rows 属性污染产生的假象，
    // 误当作 Semi 真实行为写入了这条基线，见 TextArea.svelte 隐藏克隆节点测量修复。
    height: '30px',
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

/**
 * AIChatInput 附件卡片 —— 规则来自 Semi 源码
 * `semi-foundation/aiChatInput/aiChatInput.scss` `&-attachment` +
 * `variables.scss`（224×36、padding 8、radius 6、column-gap 8）。
 *
 * 采集方式说明：Semi 文档页需真实上传文件才出现附件卡片，无法静态截取，
 * 故此基线**取自源码规则**（$width/$height/$radius/$spacing 常量直读），
 * 属"源码为准"那一档；数值本身是编译期常量，不受主题/视口影响。
 */
export const AI_CHAT_INPUT_ATTACHMENT: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-attachment + variables.scss',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-attachment',
  computed: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    borderRadius: '6px',
    padding: '8px',
    width: '224px',
    height: '36px',
    overflow: 'hidden',
    flexShrink: '0',
    position: 'relative',
  },
};

/** 附件卡片名称行 —— Semi `&-attachment-content-name`（@include font-size-small → 12px/16px）。 */
export const AI_CHAT_INPUT_ATTACHMENT_NAME: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-attachment-content-name',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-attachment-content-name',
  computed: {
    width: '180px',
    height: '20px',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '600',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
};

/** 附件左侧图标/缩略图 —— Semi `&-attachment-icon, &-attachment-img`（36×36 + radius 3px）。 */
export const AI_CHAT_INPUT_ATTACHMENT_ICON: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-attachment-icon',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-attachment-icon',
  computed: {
    width: '36px',
    height: '36px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  },
};

/**
 * 技能项 —— Semi `&-skill &-item`（flex + column-gap 8 + padding 8/20 + cursor:pointer）。
 * 本基线同时守住「组件拆分后 scoped CSS 没跟着搬」这类静默失效：
 * 样式若留在父组件，拆分后这些值会全部塌回浏览器默认，用例即红。
 */
export const AI_CHAT_INPUT_SKILL_ITEM: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-skill &-item',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-skill-item',
  computed: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '20px',
    paddingRight: '20px',
    cursor: 'pointer',
  },
};

/** 建议项 —— Semi `&-suggestion &-item`（radius 6 + padding 8/20 + @include font-size-regular）。 */
export const AI_CHAT_INPUT_SUGGESTION_ITEM: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-suggestion &-item',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-suggestion-item',
  computed: {
    borderRadius: '6px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '20px',
    paddingRight: '20px',
    fontSize: '14px',
    lineHeight: '20px',
  },
};

/** 引用条容器 —— Semi `&-references`（@include font-size-small + 4px 双向间距 + 8px 下外距）。 */
export const AI_CHAT_INPUT_REFERENCES: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-references',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-references',
  computed: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '8px',
    fontSize: '12px',
    lineHeight: '16px',
    columnGap: '4px',
    rowGap: '4px',
  },
};

/** 引用项 —— Semi `&-reference`（padding 8/12 + radius 6 + column-gap 8）。 */
export const AI_CHAT_INPUT_REFERENCE: MetricBaseline = {
  source: 'semi-foundation/aiChatInput/aiChatInput.scss &-reference',
  measuredAt: '2026-07-31',
  semiSelector: '.semi-aiChatInput-reference',
  computed: {
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    boxSizing: 'border-box',
  },
};
