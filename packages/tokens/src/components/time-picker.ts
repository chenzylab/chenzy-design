/**
 * Component tokens for TimePicker. 全量对齐 Semi Design（semi-foundation/timePicker/variables.scss
 * 23 行 / 14 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * TimePicker = 触发输入框（trigger/input，复用 Input）+ 下拉滚动列面板（复用 ScrollList/ScrollItem）。
 * - 触发输入框部分复用 Input 填充式外观（--cd-input-*），仅保留 Semi 的 `$radius-timePicker_input`
 *   （输入框圆角）作为 TimePicker 专属圆角 token。
 * - 面板列容器/背景/阴影走 ScrollList 自身 token（--cd-color-scroll-list-* / --cd-shadow-scroll-list
 *   等，由 ScrollList/ScrollItem 组件内部消费）；TimePicker 仅额外定义 Semi timePicker 专属的列宽
 *   （panel-list-*）/面板高/range 双列分割线/阴影/圆角 token，组件在 :global 覆盖里消费。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + components/scroll-list.ts）：
 * - Semi `$color-timePicker_range_picker_panel_split-border` → kebab
 *   `color-time-picker-range-picker-panel-split-border`，`var(--semi-color-border)` → `var(--cd-color-border)`。
 * - Semi `rgba(0, 0, 0, .1)` / `0 4px 14px rgba(0, 0, 0, .1)` → 保留字面量（补全 `.1` → `0.1`）。
 * - Semi `$height-scrollList_item: 36px` 不在此重复定义：滚动列项高由 ScrollList/ScrollItem 组件自身
 *   token（`--cd-height-scroll-list-item` = 36px）驱动，TimePicker 复用 ScrollList 即自动继承。
 * - Semi `var(--semi-border-radius-medium)` → `var(--cd-border-radius-medium)`（= 6px）。
 * - Semi `var(--semi-border-radius-small)` → `var(--cd-border-radius-small)`（= 3px）。
 * - 字面量宽高（252px / 64px / 72px / 1px / 2px / 0）保留。
 * - Semi 无 shadow category，我们 TokenCategory 亦无，`$shadow-*` 归 other。
 *
 * 全部 token 严格对齐 Semi variables.scss，无自造超集中间层。
 */
import type { TokenGroup } from './token-def.js';

export const timePickerTokens = {
  // —— 面板分割线 / 描边（color）——
  'color-time-picker-range-picker-panel-split-border': { value: 'var(--cd-color-border)', category: 'color', label: '菜单分割线色', usage: '时间选择器菜单分割线颜色' },
  'color-time-picker-range-panel-border': { value: 'rgba(0, 0, 0, 0.1)', category: 'color', label: '描边色', usage: '时间选择器描边颜色' },

  // —— 面板尺寸（width / height）——
  'width-time-picker-range-panel-border': { value: '1px', category: 'width', label: '菜单分割线宽度', usage: '时间选择器菜单分割线宽度' },
  'height-time-picker-panel-body': { value: '252px', category: 'height', label: '菜单高度', usage: '时间选择器菜单高度' },
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
} satisfies TokenGroup;
