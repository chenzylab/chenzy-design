/**
 * Component tokens for Notification (M5 Feedback). 严格对齐 Semi Design
 * （semi-foundation/notification/variables.scss，共 35 个），无自造中间变量。
 * 组件（NotificationItem / NotificationContainer）直接消费这些对齐名，
 * 与 Semi scss 直接引用 `$color-notification-*` / `$spacing-notification-*` 的方式一致。
 *
 * 映射约定（Semi → chenzy）：
 *   `$color-notification-*` 的 `var(--semi-color-*)` → `var(--cd-color-*)`
 *   `$spacing-*`  → `var(--cd-spacing-*)`（字面量 0 / 8px 保留）
 *   `var(--semi-border-radius-*)` → `var(--cd-border-radius-*)`
 *   `$font-weight-*` → `var(--cd-font-weight-*)`
 *   `$width-icon-*`  → `var(--cd-width-icon-*)`
 *   其余字面量（auto / 320px / 1px）保留。
 */
import type { TokenGroup } from './token-def.js';

export const notificationTokens = {
  // —— Color（对齐 Semi variables.scss「Color」段 17 个）——
  'color-notification-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '通知背景色', usage: '通知背景色' },
  'color-notification-info-icon': { value: 'var(--cd-color-info)', category: 'color', label: '信息图标色', usage: '通知 信息 图标颜色' },
  'color-notification-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标色', usage: '通知 警告 图标颜色' },
  'color-notification-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '危险图标色', usage: '通知 危险 图标颜色' },
  'color-notification-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标色', usage: '通知 成功 图标颜色' },
  'color-notification-title-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文本色', usage: '通知 标题 文本颜色' },
  'color-notification-content-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '内容文本色', usage: '通知 内容 文本颜色' },
  'color-notification-closebtn-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮图标色', usage: '通知 关闭按钮 图标颜色' },
  'color-notification-warning-light-bg': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '彩色警告背景色', usage: '彩色通知警告背景色' },
  'color-notification-warning-light-border': { value: 'var(--cd-color-warning)', category: 'color', label: '彩色警告描边色', usage: '彩色通知警告描边色' },
  'color-notification-success-light-bg': { value: 'var(--cd-color-success-light-default)', category: 'color', label: '彩色成功背景色', usage: '彩色通知成功背景色' },
  'color-notification-success-light-border': { value: 'var(--cd-color-success)', category: 'color', label: '彩色成功描边色', usage: '彩色通知成功描边色' },
  'color-notification-info-light-bg': { value: 'var(--cd-color-info-light-default)', category: 'color', label: '彩色信息背景色', usage: '彩色通知信息背景色' },
  'color-notification-info-light-border': { value: 'var(--cd-color-info)', category: 'color', label: '彩色信息描边色', usage: '彩色通知信息描边色' },
  'color-notification-danger-light-bg': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '彩色危险背景色', usage: '彩色通知危险背景色' },
  'color-notification-danger-light-border': { value: 'var(--cd-color-danger)', category: 'color', label: '彩色危险描边色', usage: '彩色通知危险描边色' },
  'color-notification-ambient-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '叠加层背景色', usage: '透明背景色叠加层(与bg0保持一致不建议修改)' },

  // —— Width/Height（对齐 Semi「Width/Height」段 4 个）——
  'width-notification-notice': { value: 'auto', category: 'width', label: '通知宽度', usage: '通知宽度' },
  'width-notification-notice-minwidth': { value: '320px', category: 'width', label: '通知最小宽度', usage: '通知最小宽度' },
  'width-notification-notice-icon': { value: 'var(--cd-width-icon-extra-large)', category: 'width', label: '通知图标宽度', usage: '通知图标宽度' },
  'width-notification-notice-border': { value: '1px', category: 'width', label: '通知描边宽度', usage: '通知描边宽度' },

  // —— Spacing（对齐 Semi「Spacing」段 11 个）——
  'spacing-notification-list-margin': { value: '0', category: 'spacing', label: '列表外边距', usage: '通知列表外边距' },
  'spacing-notification-list-padding': { value: '0', category: 'spacing', label: '列表内边距', usage: '通知列表内边距' },
  'spacing-notification-notice-paddingtop': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片顶内边距', usage: '通知卡片顶部内边距' },
  'spacing-notification-notice-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片右内边距', usage: '通知卡片右侧内边距' },
  'spacing-notification-notice-paddingbottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片底内边距', usage: '通知卡片底部内边距' },
  'spacing-notification-notice-paddingleft': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片左内边距', usage: '通知卡片左侧内边距' },
  'spacing-notification-notice-margin': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片外边距', usage: '通知卡片外边距' },
  'spacing-notification-notice-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片右外边距', usage: '通知卡片右侧外边距' },
  'spacing-notification-notice-title-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标题底外边距', usage: '通知卡片标题底部外边距' },
  'spacing-notification-notice-content-wrapper-marginright': { value: '8px', category: 'spacing', label: '内容右外边距', usage: '通知卡片内容右侧外边距' },
  'spacing-notification-notice-icon-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标右外边距', usage: '通知卡片图标右侧外边距' },

  // —— Radius（对齐 Semi「Radius」段 1 个）——
  'radius-notification-notice': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '通知卡片圆角大小' },

  // —— Font（对齐 Semi「Font」段 2 个）——
  'font-notification-notice-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '通知卡片标题字重' },
  'font-notification-notice-content-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '内容字重', usage: '通知卡片内容字重' },
} satisfies TokenGroup;
