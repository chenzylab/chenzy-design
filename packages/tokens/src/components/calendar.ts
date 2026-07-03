/**
 * Component tokens for Calendar。仅保留 Calendar.svelte 实际消费的 token（Token 精简原则：
 * 只留组件真消费的，删孤儿）。曾全量对齐 Semi 的 94 个变量，组件未消费的已按孤儿清理删除；
 * 现存均为 chenzy-design Calendar.svelte 消费的补充 token（原名，Semi 无独立变量 / 命名差异）。
 * 值对齐 Semi 语义，为 var() 引用我们的 alias / global token 或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const calendarTokens = {
  // ============================ 组件消费段（Semi 无独立变量 / 命名差异；Calendar.svelte 消费）============================
  // 老式裸值 token，升级为 TokenDef、原名保留，值对齐 Semi 语义，避免组件悬空。
  'calendar-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '日历背景', usage: '日历整体背景（组件消费）' },
  'calendar-border': { value: 'var(--cd-color-border)', category: 'color', label: '日历描边', usage: 'Semi $color-calendar_day-border（组件消费）' },
  'calendar-header-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '头部背景', usage: '工具栏 / 全天区背景（组件消费）' },
  'calendar-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '日历文字', usage: 'Semi $color-calendar_date-text-default（组件消费）' },
  'calendar-text-secondary': { value: 'var(--cd-color-text-2)', category: 'color', label: '日历次要文字', usage: 'Semi $color-calendar_day-text-default（星期 / 非当月 / 时间标签）（组件消费）' },
  'calendar-today-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '今日背景', usage: 'Semi $color-calendar-bg-active（今日实底 primary）（组件消费）' },
  'calendar-today-fg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '今日文字', usage: 'Semi $color-calendar-text-active（今日浅字 bg-1）（组件消费）' },
  'calendar-selected-border': { value: 'var(--cd-color-primary)', category: 'color', label: '选中边框', usage: '选中日期边框高亮（组件消费）' },
  'calendar-range-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围区间背景', usage: 'range 区间内连续填充背景（组件消费）' },
  'calendar-range-edge-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围端点背景', usage: 'range 起止端点背景（组件消费）' },
  'calendar-week-cell-min-h': { value: '240px', category: 'height', label: '周视图格最小高', usage: 'week 模式单行日格最小高度（组件消费）' },
  'calendar-weekend-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '周末背景', usage: 'Semi $color-calendar_weekend-bg（周末列背景）（组件消费）' },
  'calendar-cell-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日格悬浮背景', usage: '日格 / 事件块悬浮背景（组件消费）' },
  'calendar-event-default-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '事件默认色', usage: '事件竖条默认强调色（组件消费）' },
  'calendar-disabled-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用背景', usage: '禁用日格背景 / 斜纹填充（组件消费）' },
  'calendar-more-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '更多按钮文字色', usage: '+N 折叠按钮文字色（组件消费）' },
  'calendar-cell-min-h': { value: '96px', category: 'height', label: '日格最小高', usage: 'month 模式日格最小高度（组件消费）' },
  'calendar-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '日历圆角', usage: '日历外框 / 日格 / 事件块圆角（组件消费）' },
  'calendar-hour-label-w': { value: '56px', category: 'width', label: '时间标签列宽', usage: 'day 视图小时标签 / 全天标签列宽（组件消费）' },
  'calendar-hour-min-h': { value: '40px', category: 'height', label: '小时行最小高', usage: 'day 视图每小时行最小高度（组件消费）' },
  'calendar-curr-time-color': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间线色', usage: 'Semi $color-calendar_curr-bg（当前时间红线 / 原点）（组件消费）' },
} satisfies TokenGroup;
