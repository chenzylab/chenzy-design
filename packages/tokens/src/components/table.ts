/**
 * Component tokens for Table. 对齐 Semi Design（semi-foundation/table/variables.scss），
 * 仅保留组件实际消费的 token，并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Table 实际消费的补充 token（Semi 无；组件消费）。
 *
 * 映射规则（照抄 checkbox.ts/modal.ts/tabs.ts）：
 * - Semi `$xxx-table_yyy` → kebab 小写，`--semi-color-*` → `--cd-color-*` 一一对应。
 * - `$spacing-*` → `--cd-spacing-*` 同名；`var(--semi-border-radius-*)` → `var(--cd-border-radius-*)`。
 * - 字面量保留；calc/嵌套忠实翻译。
 * - Semi `rgba(var(--semi-grey-0), 1)`（= #f9f9f9）我们无 --cd-grey-0 alias，用最接近的
 *   语义 --cd-color-fill-0（分组底纹意图一致）替代，未发明新 alias（见 usage 注明）。
 */
import type { TokenGroup } from './token-def.js';

export const tableTokens = {
  // —— Spacing（内边距 / 外边距 / 偏移）——
  'spacing-table-column-sorter-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '排序按钮左外边距', usage: '表头标题与排序按钮间距' },
  'spacing-table-column-filter-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '过滤按钮左外边距', usage: '列过滤器按钮左侧外边距' },
  'spacing-table-expand-icon-marginright': { value: '8px', category: 'spacing', label: '展开按钮右外边距', usage: '行展开按钮右侧外边距' },

  // —— Color ——
  'color-table-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '单元格文字色', usage: '单元格默认文字颜色' },
  'color-table-row-expanded-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '展开行背景色', usage: '表格展开行背景颜色 - 默认' },
  'color-table-expanded-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '展开图标色', usage: '表格展开行图标颜色 - 默认' },
  'color-table-expanded-bg-default': { value: 'transparent', category: 'color', label: '展开图标容器背景色', usage: '表格展开行图标容器背景颜色 - 默认' },
  'color-table-filter-on-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '过滤激活文字色', usage: '表格过滤按钮颜色 - 激活态' },
  'color-table-filter-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '过滤默认文字色', usage: '表格过滤按钮颜色 - 默认态' },
  'color-table-resizer-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '拉伸标示线色', usage: '表格拉伸标示线颜色' },

  // —— Other（字体 / 描边样式 / 阴影 / z-index）——
  'font-table-base-fontsize': { value: '14px', category: 'font', label: '默认文本字号', usage: '表格默认文本字号' },

  // —— chenzy-design Table 实际消费的补充 token（Semi 无；组件消费）——
  'table-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '表格背景色', usage: '表格整体背景（组件消费）' },
  'table-header-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '表头背景色', usage: '表头背景（组件消费）' },
  'table-header-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '表头文字色', usage: '表头文字（组件消费）' },
  'table-cell-text': { value: 'var(--cd-color-table-text-default)', category: 'color', label: '单元格文字色', usage: '单元格文字（组件消费；转引 text-default）' },
  'table-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '边框色', usage: '单元格分割线/边框（组件消费）' },
  'table-row-hover-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '行悬浮背景色', usage: '行悬浮背景（组件消费）' },
  'table-row-selected-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '行选中背景色', usage: '行选中背景（组件消费）' },
  'table-row-stripe-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '斑马纹背景色', usage: '斑马纹行背景（组件消费）' },
  'table-cell-padding-y': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '单元格垂直内边距', usage: '默认行单元格垂直内边距（组件消费；对齐 Semi tbody-rowCell-padding）' },
  'table-cell-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '单元格水平内边距', usage: '默认行单元格水平内边距（组件消费）' },
  'table-cell-padding-y-small': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小尺寸垂直内边距', usage: '小尺寸单元格垂直内边距（组件消费；转引 small-paddingY）' },
  'table-cell-padding-y-large': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '大尺寸垂直内边距', usage: '大尺寸单元格垂直内边距（组件消费）' },
  'table-cell-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '展开内容内边距', usage: '展开行内容区内边距（组件消费）' },
  'table-sort-active-color': { value: 'var(--cd-color-primary)', category: 'color', label: '排序激活色', usage: '排序按钮激活色（组件消费）' },
  'table-sort-icon-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '排序图标色', usage: '排序/过滤图标默认色（组件消费）' },
  'table-loading-mask': { value: 'var(--cd-color-bg-0)', category: 'color', label: '加载遮罩色', usage: '加载态遮罩背景（组件消费）' },
  'table-empty-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '空态文字色', usage: '空数据文本色（组件消费）' },
  'table-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '表格圆角', usage: '表格圆角（组件消费）' },
  'table-fixed-shadow': { value: 'rgba(0, 0, 0, 0.12)', category: 'color', label: '固定列边界阴影色', usage: '固定列边界渐变阴影色（组件消费）' },
} satisfies TokenGroup;
