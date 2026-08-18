/**
 * Component tokens for Breadcrumb（M3 Navigation）。全量对齐 Semi Design
 * （semi-foundation/breadcrumb/variables.scss 16 个 + animation.scss 4 个），
 * 升级为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token。
 *
 * 注：Semi kebab 化后 `$spacing-*`→`var(--cd-spacing-*)`，`--semi-color-*`→`var(--cd-color-*)`，
 * `$font-weight-*`→`var(--cd-font-weight-*)`，`$font-size-*`→`var(--cd-font-size-*)`，
 * `--semi-transition_duration-none`→`var(--cd-motion-duration-none)`（对齐库内其它组件
 * transition token 的命名与取值先例，如 anchor/button/autocomplete）。
 * 键名保留 Semi 语义（default/active/separator/restItem），emit 为 --cd-color-breadcrumb-*。
 * Breadcrumb.svelte / Item.svelte 直接消费本文件产出的 --cd-{category}-breadcrumb-* 变量，
 * 无额外自造短名 wrapper token。
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

  // —— 过渡/变换（Semi animation.scss，面包屑文字 hover 过渡） ——
  'transition-duration-breadcrumb-link-text': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '文字过渡时长', usage: '面包屑文字-文字-动画持续时间' },
  'transition-function-breadcrumb-link-text': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '文字过渡曲线', usage: '面包屑文字-文字-过渡曲线' },
  'transition-delay-breadcrumb-link-text': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '文字过渡延迟', usage: '面包屑文字-文字-延迟时间' },
  'transform-scale-breadcrumb-link-text': { value: 'var(--cd-motion-scale-none)', category: 'animation', label: '文字缩放', usage: '面包屑文字-放大' },
} satisfies TokenGroup;
