/**
 * Component tokens for Toast (M5 Feedback). 全量对齐 Semi Design
 * （semi-foundation/toast/variables.scss 35 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Toast 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 映射规则：Semi kebab 化，$spacing-* → --cd-spacing-*，
 * var(--semi-color-*) → var(--cd-color-*)，var(--semi-border-radius-*) →
 * var(--cd-border-radius-*)，$font-weight-bold → var(--cd-font-weight-bold)。
 * calc / 字面量忠实翻译。Semi 内部 $var 互引用改为指向对应 --cd-* token
 * （落不同名，避免同名 var() 自引用死循环）。
 */
import type { TokenGroup } from './token-def.js';

export const toastTokens = {
  // —— Color：基础 ——
  'color-toast-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '提示背景色', usage: '提示背景颜色 - 默认' },
  'color-toast-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '提示文字色', usage: '提示文字颜色 - 默认' },
  'color-toast-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标色', usage: '警告提示图标颜色' },
  'color-toast-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标色', usage: '成功提示图标颜色' },
  'color-toast-info-icon': { value: 'var(--cd-color-info)', category: 'color', label: '通知图标色', usage: '通知提示图标颜色' },
  'color-toast-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标色', usage: '错误提示图标颜色' },

  // —— Color：多色（light）样式 - 警告 ——
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

  // —— Spacing ——
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

  // —— Width / Height ——
  'width-toast-wrapper': { value: '100%', category: 'width', label: '容器宽度', usage: '通知容器整体宽度' },
  'width-toast-light-border': { value: '1px', category: 'width', label: '多色描边宽度', usage: '多色样式 通知描边宽度' },

  // —— Radius ——
  'radius-toast-content': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '通知圆角', usage: '通知圆角' },

  // —— Font ——
  'font-toast-content-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '文本字重', usage: '通知文本字重' },

  // —— chenzy-design Toast 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'toast-bg': { value: 'var(--cd-color-toast-bg-default)', category: 'color', label: '卡片背景色', usage: 'Toast 卡片背景（组件消费）' },
  'toast-color-text': { value: 'var(--cd-color-toast-text-default)', category: 'color', label: '文字色', usage: 'Toast 文字颜色（组件消费）' },
  'toast-color-icon-info': { value: 'var(--cd-color-toast-info-icon)', category: 'color', label: '通知图标色', usage: 'info/loading 图标颜色（组件消费）' },
  'toast-color-icon-success': { value: 'var(--cd-color-toast-success-icon)', category: 'color', label: '成功图标色', usage: 'success 图标颜色（组件消费）' },
  'toast-color-icon-warning': { value: 'var(--cd-color-toast-warning-icon)', category: 'color', label: '警告图标色', usage: 'warning 图标颜色（组件消费）' },
  'toast-color-icon-error': { value: 'var(--cd-color-toast-danger-icon)', category: 'color', label: '错误图标色', usage: 'error 图标颜色（组件消费）' },
  'toast-color-close': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '关闭按钮颜色 - 默认（组件消费）' },
  'toast-color-close-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '关闭按钮悬浮色', usage: '关闭按钮颜色 - 悬浮（组件消费）' },
  'toast-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费）' },
  'toast-outline-focus-color': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦轮廓色', usage: '关闭按钮聚焦轮廓颜色（组件消费）' },
  'toast-radius': { value: 'var(--cd-radius-toast-content)', category: 'radius', label: '卡片圆角', usage: 'Toast 卡片圆角（组件消费）' },
  'toast-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '卡片阴影', usage: 'Toast 卡片阴影（组件消费）' },
  'toast-padding': { value: 'var(--cd-spacing-toast-content-paddingy) var(--cd-spacing-toast-content-paddingx)', category: 'spacing', label: '卡片内边距', usage: 'Toast 内容内边距（组件消费）' },
  'toast-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内部间距', usage: '图标/内容/关闭间距（组件消费）' },
  'toast-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '文字字号', usage: 'Toast 文字字号（组件消费）' },
  'toast-font-weight': { value: 'var(--cd-font-toast-content-fontweight)', category: 'font', label: '文字字重', usage: 'Toast 文字字重（组件消费）' },
  'toast-max-width': { value: '420px', category: 'width', label: '卡片最大宽', usage: 'Toast 卡片最大宽度（组件消费）' },
  'toast-min-width': { value: '240px', category: 'width', label: '卡片最小宽', usage: 'Toast 卡片最小宽度（组件消费）' },
  'toast-stack-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '堆叠间距', usage: '同方位多条堆叠纵向间距（组件消费）' },
  'toast-z': { value: 'var(--cd-z-toast)', category: 'other', label: '层级', usage: 'Toast 容器 z-index（组件消费）' },
  'toast-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '过渡时长', usage: '关闭按钮颜色过渡时长（组件消费）' },
  // dark 主题卡片（对齐 Notification dark theme；Semi toast 无 dark token，组件消费）
  'toast-bg-dark': { value: 'var(--cd-color-text-0)', category: 'color', label: '深色卡片背景', usage: 'dark 主题卡片背景（组件消费）' },
  'toast-color-text-dark': { value: 'var(--cd-color-bg-0)', category: 'color', label: '深色卡片文字', usage: 'dark 主题卡片文字（组件消费）' },
  'toast-color-close-dark': { value: 'var(--cd-color-bg-2)', category: 'color', label: '深色关闭按钮', usage: 'dark 主题关闭按钮颜色（组件消费）' },
  'toast-color-close-hover-dark': { value: 'var(--cd-color-bg-0)', category: 'color', label: '深色关闭悬浮', usage: 'dark 主题关闭按钮悬浮颜色（组件消费）' },
} satisfies TokenGroup;
