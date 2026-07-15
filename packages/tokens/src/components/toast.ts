/**
 * Component tokens for Toast — 严格全量对齐 Semi Design
 * （semi-foundation/toast/variables.scss，35 个变量），带元数据的 TokenDef 结构以支持 DSM。
 *
 * 映射规则（对齐 Notification 既有约定）：Semi kebab 化（下划线段也转连字符），
 * $spacing-* → var(--cd-spacing-*)，var(--semi-color-*) → var(--cd-color-*)，
 * var(--semi-border-radius-*) → var(--cd-border-radius-*)，$font-weight-bold →
 * var(--cd-font-weight-bold)。Semi 内部 $var 互引用改为指向对应 --cd-* token
 * （落不同名，避免同名 var() 自引用死循环）。字面量忠实翻译。
 *
 * 无自造中间变量、无 dark 主题 token（Semi toast 皆无）。组件 .svelte 直接消费这些完整名，
 * 卡片阴影/字号/z-index/图标尺寸等来自全局 mixin（Semi @include shadow-elevated /
 * font-size-regular / $z-toast / $width-icon-large），组件层直连全局 --cd-* token。
 */
import type { TokenGroup } from './token-def.js';

export const toastTokens = {
  // —— Color：基础 ——（Semi $color-toast-bg-default 等 6 个）
  'color-toast-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '提示背景色', usage: '提示背景颜色 - 默认' },
  'color-toast-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '提示文字色', usage: '提示文字颜色 - 默认' },
  'color-toast-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标色', usage: '警告提示图标颜色' },
  'color-toast-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标色', usage: '成功提示图标颜色' },
  'color-toast-info-icon': { value: 'var(--cd-color-info)', category: 'color', label: '通知图标色', usage: '通知提示图标颜色' },
  'color-toast-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标色', usage: '错误提示图标颜色' },

  // —— Color：多色（light）样式 - 警告 ——（Semi $color-toast_warning_light-*）
  'color-toast-warning-light-bg': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告多色背景', usage: '多色样式 警告提示背景颜色' },
  'color-toast-warning-light-icon': { value: 'var(--cd-color-toast-warning-icon)', category: 'color', label: '警告多色图标', usage: '多色样式 警告提示图标颜色' },
  'color-toast-warning-light-border': { value: 'var(--cd-color-warning)', category: 'color', label: '警告多色描边', usage: '多色样式 警告提示描边颜色' },

  // —— Color：多色（light）样式 - 成功 ——
  'color-toast-success-light-bg': { value: 'var(--cd-color-success-light-default)', category: 'color', label: '成功多色背景', usage: '多色样式 成功提示背景颜色' },
  'color-toast-success-light-icon': { value: 'var(--cd-color-toast-success-icon)', category: 'color', label: '成功多色图标', usage: '多色样式 成功提示图标颜色' },
  'color-toast-success-light-border': { value: 'var(--cd-color-success)', category: 'color', label: '成功多色描边', usage: '多色样式 成功提示描边颜色' },

  // —— Color：多色（light）样式 - 通知 ——
  'color-toast-info-light-bg': { value: 'var(--cd-color-info-light-default)', category: 'color', label: '通知多色背景', usage: '多色样式 通知提示背景颜色' },
  'color-toast-info-light-icon': { value: 'var(--cd-color-toast-info-icon)', category: 'color', label: '通知多色图标', usage: '多色样式 通知提示图标颜色' },
  'color-toast-info-light-border': { value: 'var(--cd-color-info)', category: 'color', label: '通知多色描边', usage: '多色样式 通知提示描边颜色' },

  // —— Color：多色（light）样式 - 错误 ——
  'color-toast-danger-light-bg': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误多色背景', usage: '多色样式 错误提示背景颜色' },
  'color-toast-danger-light-icon': { value: 'var(--cd-color-toast-danger-icon)', category: 'color', label: '错误多色图标', usage: '多色样式 错误提示图标颜色' },
  'color-toast-danger-light-border': { value: 'var(--cd-color-danger)', category: 'color', label: '错误多色描边', usage: '多色样式 错误提示描边颜色' },

  // —— Spacing ——（Semi $spacing-toast_* 13 个）
  'spacing-toast-wrapper-top': { value: '0', category: 'spacing', label: '容器顶部位置', usage: '通知容器顶部位置' },
  'spacing-toast-content-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容垂直内边距', usage: '通知内容垂直内边距' },
  'spacing-toast-content-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内容水平内边距', usage: '通知内容水平内边距' },
  'spacing-toast-content-paddingtop': { value: 'var(--cd-spacing-toast-content-paddingy)', category: 'spacing', label: '内容上内边距', usage: '通知内容 top 内边距' },
  'spacing-toast-content-paddingbottom': { value: 'var(--cd-spacing-toast-content-paddingy)', category: 'spacing', label: '内容下内边距', usage: '通知内容 bottom 内边距' },
  'spacing-toast-content-paddingleft': { value: 'var(--cd-spacing-toast-content-paddingx)', category: 'spacing', label: '内容左内边距', usage: '通知内容 left 内边距' },
  'spacing-toast-content-paddingright': { value: 'var(--cd-spacing-toast-content-paddingx)', category: 'spacing', label: '内容右内边距', usage: '通知内容 right 内边距' },
  'spacing-toast-content-margin': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容外边距', usage: '通知内容外边距' },
  'spacing-toast-content-close-btn-margintop': { value: '-2px', category: 'spacing', label: '关闭按钮上外边距', usage: '通知关闭按钮顶部外边距' },
  'spacing-toast-content-text-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '文本左外边距', usage: '通知文本左侧外边距' },
  'spacing-toast-content-text-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '文本右外边距', usage: '通知文本右侧外边距' },
  'spacing-toast-perspective-originy': { value: '280px', category: 'spacing', label: '透视原点 Y', usage: '通知透视原点 Y 轴位置' },
  'spacing-toast-perspective': { value: '280px', category: 'spacing', label: '透视距离', usage: '通知透视距离' },

  // —— Width / Height ——（Semi $width-toast_* 2 个）
  'width-toast-wrapper': { value: '100%', category: 'width', label: '容器宽度', usage: '通知容器整体宽度' },
  'width-toast-light-border': { value: '1px', category: 'width', label: '多色描边宽度', usage: '多色样式 通知描边宽度' },

  // —— Radius ——（Semi $radius-toast_content）
  'radius-toast-content': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '通知圆角', usage: '通知圆角' },

  // —— Font ——（Semi $font-toast_content-fontWeight）
  'font-toast-content-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '文本字重', usage: '通知文本字重' },
} satisfies TokenGroup;
