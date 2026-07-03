/**
 * Component tokens for ScrollList. 全量对齐 Semi Design（semi-foundation/scrollList/variables.scss
 * 39 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 alias/index.ts + global/scales.ts）：
 * - Semi kebab 化：`scrollList` → `scroll-list`，下划线子部件 `_header` 等 → `-header`。
 * - `var(--semi-color-*)` → `var(--cd-color-*)`（bg-3 / border / text-0 / text-2 / fill-1 / fill-2 /
 *   disabled-text / primary-light-default 均已在 alias 层定义）。
 * - `$border-thickness-control` → `var(--cd-border-thickness-control)`（= 1px）。
 * - `$spacing-base` → `var(--cd-spacing-base)`（= 16px）。
 * - `var(--semi-border-radius-medium)` → `var(--cd-border-radius-medium)`（= 6px）。
 * - `$font-weight-bold` → `var(--cd-font-weight-bold)`（= 600）。
 * - calc 忠实翻译：$height-scrollList=300px、$height-scrollList_item=36px 代入字面量。
 * - `$shadow-*` 我们 TokenCategory 无 shadow，归 other，rgba `.3`/`.1` 补全为 `0.3`/`0.1`。
 * - transparent / 字面量宽高（16px / 12px / 10px / 1px / 0）保留。
 *
 * 末尾保留 chenzy-design ScrollList/ScrollColumn 实际消费的补充 token（Semi 无对应，
 * 但 ScrollList.svelte / ScrollColumn.svelte 引 `--cd-scrolllist-*`；且 TimePicker/DatePicker
 * 跨组件复用 `--cd-scrolllist-item-height`），本次保留原名收敛悬空，勿改名。
 */
import type { TokenGroup } from './token-def.js';

export const scrollListTokens = {
  // —— Color ——
  'color-scroll-list-bg': { value: 'var(--cd-color-bg-3)', category: 'color', label: '列表背景色', usage: '滚动列表背景色' },
  'color-scroll-list-border': { value: 'var(--cd-color-border)', category: 'color', label: '列表描边色', usage: '滚动列表描边颜色' },
  'color-scroll-list-header-bg': { value: 'transparent', category: 'color', label: 'header 背景色', usage: '滚动列表 header 背景色' },
  'color-scroll-list-header-title': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '滚动列表标题颜色' },
  'color-scroll-list-item-bg': { value: 'transparent', category: 'color', label: '选项背景色', usage: '滚动列表选项背景色' },
  'color-scroll-list-item-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文字色', usage: '滚动列表选项文字颜色' },
  'color-scroll-list-disabled-item-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用选项文字色', usage: '滚动列表选项背景色 - 禁用' },
  'color-scroll-list-item-text-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项文字色-悬浮', usage: '滚动列表选项文字颜色 - 悬浮' },
  'color-scroll-list-item-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '选项背景色-选中', usage: '滚动列表选项文字颜色 - 选中' },
  'color-scroll-list-selected-item-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '选中项背景色', usage: '滚动列表选中选项背景颜色' },
  'color-scroll-list-selected-item-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中项文字色', usage: '滚动列表选中选项文字颜色' },
  'color-scroll-list-selected-item-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '选中项图标色', usage: '滚动列表选中选项图标颜色' },
  'color-scroll-list-footer-border': { value: 'var(--cd-color-border)', category: 'color', label: '底部描边色', usage: '滚动列表底部描边颜色' },

  // —— Width / Height ——
  'height-scroll-list': { value: '300px', category: 'height', label: '列表高度', usage: '滚动列表高度' },
  'height-scroll-list-item': { value: '36px', category: 'height', label: '选项高度', usage: '滚动列表选项高度' },
  'width-scroll-list-item-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '选项描边宽度', usage: '滚动列表选项描边宽度' },
  'width-scroll-list-item-sel-svg': { value: '16px', category: 'width', label: '选中图标宽度', usage: '滚动列表选中图标宽度' },
  'width-scroll-list-item-wheel-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '滚轮选项描边宽度', usage: '滚动列表滚轮选项描边宽度' },
  'width-scroll-list-item-wheel-selector-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '滚轮选区描边宽度', usage: '滚动列表滚轮选区描边宽度' },
  'height-scroll-list-line': { value: '1px', category: 'height', label: '分割线高度', usage: '滚动列表分割线高度' },
  'width-scroll-list-footer-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '底部描边宽度', usage: '滚动列表底部描边宽度' },

  // —— Spacing ——
  'spacing-scroll-list-header-paddingy': { value: '0', category: 'spacing', label: 'header 垂直内边距', usage: '滚动列表 header 垂直内边距' },
  'spacing-scroll-list-header-paddingx': { value: '16px', category: 'spacing', label: 'header 水平内边距', usage: '滚动列表 header 水平内边距' },
  'spacing-scroll-list-header-title-paddingy': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题垂直内边距', usage: '滚动列表标题垂直内边距' },
  'spacing-scroll-list-header-title-paddingx': { value: '0', category: 'spacing', label: '标题水平内边距', usage: '滚动列表标题水平内边距' },
  'spacing-scroll-list-body-paddingy': { value: '0', category: 'spacing', label: '内容垂直内边距', usage: '滚动列表内容垂直内边距' },
  'spacing-scroll-list-body-paddingx': { value: '16px', category: 'spacing', label: '内容水平内边距', usage: '滚动列表内容水平内边距' },
  'spacing-scroll-list-item-ul-padding': { value: '0', category: 'spacing', label: '选项列表内边距', usage: '滚动列表选项列表内边距' },
  'spacing-scroll-list-item-ul-margin': { value: '0', category: 'spacing', label: '选项列表外边距', usage: '滚动列表选项列表外边距' },
  'spacing-scroll-list-item-ul-paddingbottom': { value: 'calc((300px - 36px) * 0.5)', category: 'spacing', label: '选项列表底部内边距', usage: '滚动列表选项列表底部内边距（(列表高 - 项高) / 2）' },
  'spacing-scroll-list-item-sel-svg-marginright': { value: '12px', category: 'spacing', label: '选中图标右外边距', usage: '滚动列表选中图标右外边距' },
  'spacing-scroll-list-item-wheel-list-outer-paddingright': { value: 'calc(36px * 0.5)', category: 'spacing', label: '滚轮列表外层右内边距', usage: '滚动列表滚轮列表外层右内边距（项高 / 2）' },
  'spacing-scroll-list-item-wheel-list-shade-pre-margintop': { value: 'calc(-1 * (36px * 0.5 + var(--cd-border-thickness-control)))', category: 'spacing', label: '滚轮遮罩上顶外边距', usage: '滚动列表滚轮上遮罩顶外边距（-(项高 / 2 + 描边宽)）' },
  'spacing-scroll-list-item-wheel-list-shade-post-margintop': { value: 'calc(36px * 0.5 + var(--cd-border-thickness-control))', category: 'spacing', label: '滚轮遮罩下顶外边距', usage: '滚动列表滚轮下遮罩顶外边距（项高 / 2 + 描边宽）' },
  'spacing-scroll-list-footer-padding': { value: '10px', category: 'spacing', label: '底部内边距', usage: '滚动列表底部内边距' },

  // —— Radius ——
  'radius-scroll-list': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '列表圆角', usage: '滚动列表圆角' },

  // —— Font ——
  'font-scroll-list-header-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '滚动列表标题字重' },
  'font-scroll-list-item-wheel-item-selected-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '滚轮选中项字重', usage: '滚动列表滚轮选中项字重' },

  // —— Other（Semi 无 shadow category，归 other） ——
  'shadow-scroll-list': { value: '0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)', category: 'other', label: '列表阴影', usage: '滚动列表阴影' },

  // —— chenzy-design ScrollList/ScrollColumn 实际消费的补充 token（Semi 无；组件 + TimePicker/DatePicker 消费；勿改名） ——
  'scrolllist-item-height': { value: '36px', category: 'height', label: '选项高度', usage: '选项高度 - 默认（组件消费；TimePicker/DatePicker 复用）' },
  'scrolllist-item-height-small': { value: '28px', category: 'height', label: '选项高度-小', usage: '选项高度 - 小尺寸（组件消费）' },
  'scrolllist-item-height-large': { value: '44px', category: 'height', label: '选项高度-大', usage: '选项高度 - 大尺寸（组件消费）' },
  'scrolllist-color-text': { value: 'var(--cd-color-scroll-list-selected-item-text)', category: 'color', label: '选中项文字色', usage: '滚动列选中项文字颜色（组件消费）' },
  'scrolllist-color-text-adjacent': { value: 'var(--cd-color-scroll-list-selected-item-icon)', category: 'color', label: '相邻项文字色', usage: '滚动列非居中项文字颜色（组件消费）' },
  'scrolllist-color-text-disabled': { value: 'var(--cd-color-scroll-list-disabled-item-text)', category: 'color', label: '禁用项文字色', usage: '滚动列禁用项文字颜色（组件消费）' },
  'scrolllist-mask-bg': { value: 'var(--cd-color-scroll-list-item-bg)', category: 'color', label: '选区遮罩背景色', usage: '中央选区遮罩背景色（组件消费）' },
  'scrolllist-mask-border': { value: 'var(--cd-color-scroll-list-border)', category: 'color', label: '选区遮罩边框色', usage: '中央选区遮罩上下边框色（组件消费）' },
  'scrolllist-gradient-color': { value: 'var(--cd-color-scroll-list-bg)', category: 'color', label: '渐隐颜色', usage: '上下渐隐起始颜色（组件消费）' },
  'scrolllist-border-color': { value: 'var(--cd-color-scroll-list-border)', category: 'color', label: '列表边框色', usage: '滚动列表外框边框色（组件消费）' },
  'scrolllist-radius': { value: 'var(--cd-radius-scroll-list)', category: 'radius', label: '列表圆角', usage: '滚动列表圆角（组件消费）' },
  'scrolllist-transition': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '滚动列项颜色过渡时长（组件消费）' },
} satisfies TokenGroup;
