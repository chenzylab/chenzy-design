/**
 * Component tokens for TimePicker. 全量对齐 Semi Design（semi-foundation/timePicker/variables.scss
 * 23 行 / 14 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * TimePicker = 触发输入框（trigger/input）+ 下拉滚动列面板（panel）。
 * - 触发输入框部分复用 Input 填充式外观（--cd-input-* / --cd-height-input-*），此处不重复造，
 *   仅保留 Semi 的 `$radius-timePicker_input`（输入框圆角）作为 TimePicker 专属圆角 token。
 * - 下拉面板部分为 timePicker 专属，在此建 --cd-time-picker-* token；面板容器背景 / 阴影 / 单元格
 *   悬浮/选中态复用 DatePicker 面板 token（--cd-date-picker-panel-* / --cd-date-picker-cell-*，
 *   对齐 TagInput 复用 Input 的做法），组件消费时保留复用（不重复造）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + components/scroll-list.ts）：
 * - Semi `$color-timePicker_range_picker_panel_split-border` → kebab
 *   `color-time-picker-range-picker-panel-split-border`，`var(--semi-color-border)` → `var(--cd-color-border)`。
 * - Semi `rgba(0, 0, 0, .1)` / `0 4px 14px rgba(0, 0, 0, .1)` → 保留字面量（补全 `.1` → `0.1`）。
 * - Semi `$height-scrollList_item: 36px` → 复用我们已有的 `var(--cd-scrolllist-item-height)`（= 36px），
 *   刻意复用（TimePicker 滚动列项高对齐 ScrollList），不写死字面量。
 * - Semi `var(--semi-border-radius-medium)` → `var(--cd-border-radius-medium)`（= 6px）。
 * - Semi `var(--semi-border-radius-small)` → `var(--cd-border-radius-small)`（= 3px）。
 * - 字面量宽高（252px / 64px / 72px / 1px / 2px / 0）保留。
 * - Semi 无 shadow category，我们 TokenCategory 亦无，`$shadow-*` 归 other。
 *
 * 末尾两项（time-col-width / time-item-height）为 chenzy-design 组件实际消费的补充 token（Semi 无对应，
 * 但 TimePicker.svelte 与 DatePicker.svelte 均引 `--cd-time-picker-time-*`），本次一并定义收敛悬空。
 */
import type { TokenGroup } from './token-def.js';

export const timePickerTokens = {
  // —— 面板分割线 / 描边（color）——
  'color-time-picker-range-picker-panel-split-border': { value: 'var(--cd-color-border)', category: 'color', label: '菜单分割线色', usage: '时间选择器菜单分割线颜色' },
  'color-time-picker-range-panel-border': { value: 'rgba(0, 0, 0, 0.1)', category: 'color', label: '描边色', usage: '时间选择器描边颜色' },

  // —— 面板尺寸（width / height）——
  'width-time-picker-range-panel-border': { value: '1px', category: 'width', label: '菜单分割线宽度', usage: '时间选择器菜单分割线宽度' },
  'height-time-picker-panel-body': { value: '252px', category: 'height', label: '菜单高度', usage: '时间选择器菜单高度' },
  'height-time-picker-scrolllist-item': { value: 'var(--cd-scrolllist-item-height)', category: 'height', label: '滚动列项高', usage: '时间选择器滚动列项高度（复用 ScrollList item 高度 36px）' },
  'width-time-picker-panel-list-ampm': { value: '72px', category: 'width', label: '上午下午列宽', usage: '时间选择器菜单中列宽度 - 上午下午' },
  'width-time-picker-panel-list-hour': { value: '64px', category: 'width', label: '小时列宽', usage: '时间选择器菜单中列宽度 - 小时' },
  'width-time-picker-panel-list-minute': { value: '64px', category: 'width', label: '分钟列宽', usage: '时间选择器菜单中列宽度 - 分钟' },
  'width-time-picker-panel-list-second': { value: '64px', category: 'width', label: '秒列宽', usage: '时间选择器菜单中列宽度 - 秒' },
  'width-time-picker-range-panel-scrolllist-body-border': { value: '2px', category: 'width', label: '双排菜单中间分割线宽度', usage: '时间范围选择器双排菜单中间分割线宽度' },

  // —— 内边距（spacing）——
  'spacing-time-picker-range-panel-scrolllist-header-body-padding': { value: '0', category: 'spacing', label: 'header 与内容内边距', usage: '时间范围选择器菜单 header 与内容内边距' },

  // —— 圆角（radius）——
  'radius-time-picker-range-panel': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '菜单圆角', usage: '时间范围选择器菜单圆角' },
  'radius-time-picker-input': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '输入框圆角', usage: '时间范围选择器圆角' },

  // —— 阴影（other，我们无 shadow category）——
  'shadow-time-picker-range-panel': { value: '0 4px 14px rgba(0, 0, 0, 0.1)', category: 'other', label: '菜单阴影', usage: '时间范围选择器菜单阴影' },

  // —— chenzy-design TimePicker 实际消费的补充 token（Semi 无；组件消费；本次一并收敛悬空）——
  // 滚动列每列宽度 / 每项高度：TimePicker.svelte 与 DatePicker.svelte 均引用。
  'time-picker-time-col-width': { value: '56px', category: 'width', label: '滚动列列宽', usage: '时间滚动列每列宽度（组件消费）' },
  'time-picker-time-item-height': { value: '28px', category: 'height', label: '滚动列项高', usage: '时间滚动列每项高度（组件消费）' },
} satisfies TokenGroup;
