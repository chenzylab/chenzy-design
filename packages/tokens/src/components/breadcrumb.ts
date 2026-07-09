/**
 * Component tokens for Breadcrumb（M3 Navigation）。全量对齐 Semi Design
 * （semi-foundation/breadcrumb/variables.scss 16 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Breadcrumb / BreadcrumbItem 实际消费的补充 token
 *（原名，Semi 无 / 命名差异；组件消费），并复用上方 Semi 对齐 token 的值。
 *
 * 注：Semi kebab 化后 `$spacing-*`→`var(--cd-spacing-*)`，`--semi-color-*`→`var(--cd-color-*)`，
 * `$font-weight-*`→`var(--cd-font-weight-*)`，`$font-size-*`→`var(--cd-font-size-*)`。
 * 键名保留 Semi 语义（default/active/separator/restItem），emit 为 --cd-color-breadcrumb-*。
 */
import type { TokenGroup } from './token-def.js';

export const breadcrumbTokens = {
  // —— 间距（Semi $spacing-breadcrumb_*） ——
  'spacing-breadcrumb-item-wrap-marginy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'Item 垂直外边距', usage: '面包屑 Item 垂直内边距' },
  'spacing-breadcrumb-item-wrap-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'Item 右外边距', usage: '面包屑 Item 右侧内边距' },
  'spacing-breadcrumb-item-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'Item 内容与分割线距离', usage: '面包屑 Item 内容与分割线距离' },
  'spacing-breadcrumb-item-text-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '文字左外边距', usage: '面包屑文字左侧外边距' },
  'spacing-breadcrumb-restitem-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'restItem 右外边距', usage: '面包屑 restItem 的右侧外边距' },

  // —— default（未选中态文字，Semi $color-breadcrumb_default-text-*） ——
  'color-breadcrumb-default-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '文字颜色 - 未选中', usage: '面包屑文字颜色 - 未选中' },
  'color-breadcrumb-default-text-hover': { value: 'var(--cd-color-link)', category: 'color', label: '文字颜色 - 悬浮', usage: '面包屑文字颜色 - 悬浮' },
  'color-breadcrumb-default-text-active': { value: 'var(--cd-color-link-hover)', category: 'color', label: '文字颜色 - 按下', usage: '面包屑文字颜色 - 按下' },

  // —— active（选中态文字，Semi $color-breadcrumb_active-text-*） ——
  'color-breadcrumb-active-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字颜色 - 选中', usage: '面包屑文字颜色 - 选中' },
  'color-breadcrumb-active-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字颜色 - 选中激活', usage: '面包屑文字颜色 - 选中激活' },

  // —— 分割线（Semi $color-breadcrumb_sepearator_default-icon-default，保留 Semi 原拼写 sepearator） ——
  'color-breadcrumb-sepearator-default-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '分割线颜色', usage: '面包屑分割线颜色' },

  // —— restItem（折叠项文字，Semi $color-breadcrumb-restItem-text-default） ——
  'color-breadcrumb-restitem-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'restItem 文字颜色', usage: '面包屑 restItem 的分割线颜色' },

  // —— 字重（Semi $font-breadcrumb_*-fontWeight） ——
  'font-breadcrumb-default-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '字重 - 未选中', usage: '面包屑文字字重 - 未选中' },
  'font-breadcrumb-active-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '字重 - 选中', usage: '面包屑文字字重 - 选中' },

  // —— 字号（Semi $font-breadcrumb_*-fontSize） ——
  'font-breadcrumb-compact-fontsize': { value: 'var(--cd-font-size-small)', category: 'font', label: '字号 - 紧凑', usage: '面包屑文字大小 - 紧凑' },
  'font-breadcrumb-loose-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '字号 - 宽松', usage: '面包屑文字大小 - 宽松' },

  // —— chenzy-design Breadcrumb / BreadcrumbItem 实际消费的补充 token（组件消费，值均复用上方 Semi 对齐 token） ——
  // 链接三态对齐 Semi：常态灰(text-2) → hover 链接蓝(link) → active 深蓝(link-hover)。
  'breadcrumb-color': { value: 'var(--cd-color-breadcrumb-default-text-default)', category: 'color', label: '默认文字色', usage: '面包屑根文字颜色（组件消费）' },
  'breadcrumb-color-link': { value: 'var(--cd-color-breadcrumb-default-text-default)', category: 'color', label: '链接文字色 - 常态', usage: '可点击项文字颜色 - 常态（对齐 Semi item 常态灰，组件消费）' },
  'breadcrumb-color-link-hover': { value: 'var(--cd-color-breadcrumb-default-text-hover)', category: 'color', label: '链接文字色 - 悬浮', usage: '可点击项文字颜色 - 悬浮（对齐 Semi item-link:hover，组件消费）' },
  'breadcrumb-color-link-active': { value: 'var(--cd-color-breadcrumb-default-text-active)', category: 'color', label: '链接文字色 - 按下', usage: '可点击项文字颜色 - 按下（对齐 Semi item-link:active，组件消费）' },
  'breadcrumb-color-active': { value: 'var(--cd-color-breadcrumb-active-text-default)', category: 'color', label: '当前页文字色', usage: '当前页 / 选中项文字颜色（组件消费）' },
  'breadcrumb-restitem-color': { value: 'var(--cd-color-breadcrumb-restitem-text-default)', category: 'color', label: '折叠项文字色', usage: '折叠 … 触发器 / restItem 文字颜色（对齐 Semi restItem，组件消费）' },
  'breadcrumb-active-weight': { value: 'var(--cd-font-breadcrumb-active-fontweight)', category: 'font', label: '当前页字重', usage: '当前页 / 选中项字重（组件消费）' },
  'breadcrumb-separator-color': { value: 'var(--cd-color-breadcrumb-sepearator-default-icon-default)', category: 'color', label: '分割符颜色', usage: '分割符颜色（组件消费）' },
  'breadcrumb-gap': { value: 'var(--cd-spacing-breadcrumb-restitem-marginright)', category: 'spacing', label: '项间距', usage: '面包屑项间距（组件消费）' },
  'breadcrumb-font-size': { value: 'var(--cd-font-breadcrumb-loose-fontsize)', category: 'font', label: '根字号', usage: '面包屑根字号 - 默认（组件消费）' },
  'breadcrumb-font-size-compact': { value: 'var(--cd-font-breadcrumb-compact-fontsize)', category: 'font', label: '紧凑字号', usage: '紧凑模式字号（组件消费）' },
  // 宽松模式（compact=false）可调项
  'breadcrumb-loose-font-size': { value: 'var(--cd-breadcrumb-font-size)', category: 'font', label: '宽松字号', usage: '宽松模式字号（组件消费）' },
  'breadcrumb-loose-letter-spacing': { value: '0.01em', category: 'other', label: '宽松字间距', usage: '宽松模式字间距（组件消费）' },
  'breadcrumb-loose-gap': { value: 'calc(var(--cd-breadcrumb-gap) * 1.5)', category: 'spacing', label: '宽松项间距', usage: '宽松模式项间距（组件消费）' },
  'breadcrumb-item-max-width': { value: '12em', category: 'width', label: '截断项最大宽度', usage: 'showTooltip 截断项最大宽度（组件消费）' },
} satisfies TokenGroup;
