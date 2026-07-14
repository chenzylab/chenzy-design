/**
 * Machine-readable component metadata for AI/docs consumption.
 * Banner — 严格对齐 Semi Design（semi-ui/banner）。
 */
export const meta = {
  name: 'Banner',
  category: 'feedback',
  description:
    '通知横幅：横幅通常用于标识全页的状态或通知等，常驻并由用户主动关闭。支持 info / success / danger / warning 四语义，fullMode 全屏与非全屏（可 bordered 边框）两形态；title / description / icon / closeIcon 可自定义，children 渲染于尾部 extra 区。role="alert"，关闭按钮可 Tab + Enter/Space。',
  exports: ['Banner'],
  props: [
    {
      name: 'type',
      type: "'info'|'success'|'danger'|'warning'",
      default: "'info'",
      desc: '类型，决定背景 / 文本 / 图标语义色',
    },
    { name: 'fullMode', type: 'boolean', default: 'true', desc: '是否为全屏模式' },
    {
      name: 'bordered',
      type: 'boolean',
      default: 'false',
      desc: '是否展示边框，仅在非全屏模式下有效',
    },
    { name: 'title', type: 'string', default: "''", desc: '标题文本，被 titleSnippet 覆盖' },
    {
      name: 'description',
      type: 'string',
      default: "''",
      desc: '描述内容，被 descriptionSnippet 覆盖',
    },
    { name: 'icon', type: 'Snippet | null', default: 'undefined', desc: '自定义 icon，为 null 时不显示 icon' },
    {
      name: 'closeIcon',
      type: 'Snippet | null',
      default: 'undefined',
      desc: '自定义关闭 icon，为 null 时不显示关闭按钮',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '自定义渲染内容，渲染于尾部 extra 区' },
    { name: 'titleSnippet', type: 'Snippet', default: 'undefined', desc: '自定义标题片段，覆盖 title' },
    {
      name: 'descriptionSnippet',
      type: 'Snippet',
      default: 'undefined',
      desc: '自定义描述片段，覆盖 description',
    },
    { name: 'onClose', type: '(e: MouseEvent) => void', default: 'undefined', desc: '关闭时的回调函数' },
    { name: 'class', type: 'string', default: "''", desc: '类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '样式' },
  ],
  events: [{ name: 'onClose', desc: '关闭按钮触发关闭' }],
  slots: [
    { name: 'children', desc: '自定义渲染内容，渲染于尾部 extra 区' },
    { name: 'titleSnippet', desc: '自定义标题片段，覆盖 title prop' },
    { name: 'descriptionSnippet', desc: '自定义描述片段，覆盖 description prop' },
    { name: 'icon', desc: '自定义图标；传 null 不显示' },
    { name: 'closeIcon', desc: '自定义关闭图标；传 null 不显示关闭按钮' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: 'role="alert"（对齐 Semi）；关闭按钮 aria-label「关闭」可 Tab 聚焦，Enter/Space 关闭；默认语义图标 aria-label 标注类型。',
  },
  tokens: [
    // —— Semi 对齐 token（semi-foundation/banner/variables.scss，22 个，无一增减） ——
    '--cd-color-banner-info-bg-default',
    '--cd-color-banner-info-text-default',
    '--cd-color-banner-info-border-default',
    '--cd-color-banner-warning-bg-default',
    '--cd-color-banner-warning-text-default',
    '--cd-color-banner-warning-border-default',
    '--cd-color-banner-success-bg-default',
    '--cd-color-banner-success-text-default',
    '--cd-color-banner-success-border-default',
    '--cd-color-banner-danger-bg-default',
    '--cd-color-banner-danger-text-default',
    '--cd-color-banner-danger-border-default',
    '--cd-radius-banner',
    '--cd-spacing-banner-closebtn-marginleft',
    '--cd-spacing-banner-extra-margintop',
    '--cd-spacing-banner-icon-marginright',
    '--cd-spacing-banner-paddingx',
    '--cd-spacing-banner-paddingy',
    '--cd-spacing-banner-title-description-margintop',
    '--cd-height-banner-closebtn',
    '--cd-width-banner-closebtn',
    '--cd-width-banner-border',
  ],
  responsive: false,
  examples: [
    {
      title: '基本用法',
      code: '<Banner description="Semi D2C 现已支持 Figma DevMode, 安装插件，随时查阅图层对应的前端代码" />',
    },
    { title: '不同类型', code: '<Banner type="warning" description="当前使用 API 已过期，请尽快升级" />' },
    {
      title: '非全屏 + 边框',
      code: '<Banner fullMode={false} bordered type="info" title="不知道 AppKey？" description="请联系对应研发同学。" />',
    },
  ],
} as const;
