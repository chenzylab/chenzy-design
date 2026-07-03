/**
 * Component tokens for Notification (M5 Feedback). 全量对齐 Semi Design
 * （semi-foundation/notification/variables.scss，35 个），并升级为带元数据的
 * TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token 或字面量。
 * 末尾保留 chenzy-design Notification 实际消费的补充 token（含旧 token 名，
 * 值对齐 Semi；组件消费）。
 *
 * 映射约定：Semi kebab 化，`--semi-color-*`→`--cd-color-*`，
 * `$spacing-*`→`var(--cd-spacing-*)`，`var(--semi-border-radius-*)`→`var(--cd-border-radius-*)`，
 * `$font-weight-*`→`var(--cd-font-weight-*)`，`$width-icon-*`→`var(--cd-width-icon-*)`，
 * 字面量保留。注意 var() 自引用需落不同名（下方 notification-* 消费段直接给值，不自引用）。
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

  // —— chenzy-design Notification 实际消费的补充 token（旧 token 名，值对齐 Semi；组件消费）——
  // 尺寸 / 布局
  'notification-width': { value: 'var(--cd-width-notification-notice-minwidth)', category: 'width', label: '通知宽度', usage: '单条通知卡片宽度（组件消费；对齐 Semi minWidth 320）' },
  'notification-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '卡片内边距', usage: '卡片内边距（组件消费；对齐 Semi paddingTop/Bottom base）' },
  'notification-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标内容间距', usage: '图标与内容间距 / 堆叠列间距（组件消费；对齐 Semi icon-marginRight）' },
  'notification-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '卡片圆角（组件消费；对齐 Semi medium）' },
  'notification-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '卡片阴影', usage: '卡片投影（组件消费）' },
  'notification-offset': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '视口偏移', usage: '堆叠列距视口边缘偏移（组件消费）' },
  'notification-z': { value: 'var(--cd-z-notification)', category: 'other', label: '层叠层级', usage: '通知层叠层级（组件消费；对齐 Semi z-index 1010）' },
  'notification-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '关闭按钮色彩过渡时长（组件消费）' },
  // 卡片文案 / 背景 / 边框（light）
  'notification-bg': { value: 'var(--cd-color-notification-bg-default)', category: 'color', label: '卡片背景色', usage: '卡片背景（组件消费；对齐 Semi bg-3）' },
  'notification-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片边框色', usage: '卡片边框（组件消费）' },
  'notification-color-title': { value: 'var(--cd-color-notification-title-text)', category: 'color', label: '标题文本色', usage: '标题文本颜色（组件消费；对齐 Semi text-0）' },
  'notification-color-content': { value: 'var(--cd-color-notification-content-text)', category: 'color', label: '内容文本色', usage: '内容文本颜色（组件消费；对齐 Semi text-1）' },
  'notification-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '标题字号（组件消费）' },
  'notification-title-weight': { value: 'var(--cd-font-notification-notice-title-fontweight)', category: 'font', label: '标题字重', usage: '标题字重（组件消费；对齐 Semi bold）' },
  'notification-content-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '内容字号', usage: '内容字号（组件消费）' },
  // 类型图标色
  'notification-icon-success': { value: 'var(--cd-color-notification-success-icon)', category: 'color', label: '成功图标色', usage: '成功类型图标色（组件消费）' },
  'notification-icon-info': { value: 'var(--cd-color-notification-info-icon)', category: 'color', label: '信息图标色', usage: '信息类型图标色（组件消费；对齐 Semi color-info）' },
  'notification-icon-warning': { value: 'var(--cd-color-notification-warning-icon)', category: 'color', label: '警告图标色', usage: '警告类型图标色（组件消费）' },
  'notification-icon-error': { value: 'var(--cd-color-notification-danger-icon)', category: 'color', label: '错误图标色', usage: '错误类型图标色（组件消费；对齐 Semi danger）' },
  // 关闭按钮
  'notification-close-color': { value: 'var(--cd-color-notification-closebtn-icon)', category: 'color', label: '关闭按钮色', usage: '关闭按钮默认色（组件消费；对齐 Semi text-2）' },
  'notification-close-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '关闭按钮悬浮色', usage: '关闭按钮悬浮色（组件消费）' },
  // 内容顶部间距（对齐 Semi title-marginBottom / extra-tight）
  'notification-content-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '内容顶间距', usage: '内容距标题顶部间距（组件消费；对齐 Semi title-marginBottom）' },
  // footer 操作区
  'notification-footer-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'footer 项间距', usage: 'footer 操作项间距（组件消费）' },
  'notification-footer-margintop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 顶间距', usage: 'footer 距内容顶部间距（组件消费）' },
  // 关闭按钮聚焦轮廓
  'notification-focus-outline-color': { value: 'var(--cd-color-primary)', category: 'color', label: '聚焦轮廓色', usage: '关闭按钮聚焦轮廓色（组件消费）' },
  'notification-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费）' },
  // showProgress 倒计时进度条
  'notification-progress-height': { value: '3px', category: 'height', label: '进度条高度', usage: '倒计时进度条高度（组件消费）' },
  'notification-progress-color': { value: 'var(--cd-color-primary)', category: 'color', label: '进度条颜色', usage: '倒计时进度条颜色（组件消费）' },
  // dark 主题卡片
  'notification-bg-dark': { value: 'var(--cd-color-text-0)', category: 'color', label: '深色卡片背景', usage: '深色主题卡片背景（组件消费）' },
  'notification-border-dark': { value: 'var(--cd-color-text-0)', category: 'color', label: '深色卡片边框', usage: '深色主题卡片边框（组件消费）' },
  'notification-color-title-dark': { value: 'var(--cd-color-bg-0)', category: 'color', label: '深色标题文本', usage: '深色主题标题文本（组件消费）' },
  'notification-color-content-dark': { value: 'var(--cd-color-bg-1)', category: 'color', label: '深色内容文本', usage: '深色主题内容文本（组件消费）' },
  'notification-close-color-dark': { value: 'var(--cd-color-bg-2)', category: 'color', label: '深色关闭按钮', usage: '深色主题关闭按钮（组件消费）' },
  'notification-close-color-hover-dark': { value: 'var(--cd-color-bg-0)', category: 'color', label: '深色关闭悬浮', usage: '深色主题关闭按钮悬浮（组件消费）' },
} satisfies TokenGroup;
