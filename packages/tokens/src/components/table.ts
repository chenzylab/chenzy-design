/**
 * Component tokens for Table. 全量对齐 Semi Design（semi-foundation/table/variables.scss，
 * 74 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
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
  'spacing-table-paddingy': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '空数据垂直内边距', usage: '表格空数据占位及虚拟列表分组垂直内边距' },
  'spacing-table-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '空数据水平内边距', usage: '表格空数据占位及虚拟列表分组水平内边距' },
  'spacing-table-middle-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '中尺寸垂直内边距', usage: '中尺寸表格单元格垂直内边距' },
  'spacing-table-small-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小尺寸垂直内边距', usage: '小尺寸表格单元格垂直内边距' },
  'spacing-table-title-paddingy': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题垂直内边距', usage: '表格标题垂直内边距' },
  'spacing-table-title-paddingx': { value: '0', category: 'spacing', label: '标题水平内边距', usage: '表格标题水平内边距' },
  'spacing-table-footer-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'footer 内边距', usage: '表格 footer 内边距' },
  'spacing-table-expand-row-paddingleft': { value: '16px', category: 'spacing', label: '展开行左内边距', usage: '表格展开行左侧内边距' },
  'spacing-table-expand-row-paddingright': { value: '16px', category: 'spacing', label: '展开行右内边距', usage: '表格展开行右侧内边距' },
  'spacing-table-expand-row-paddingtop': { value: '16px', category: 'spacing', label: '展开行上内边距', usage: '表格展开行顶部内边距' },
  'spacing-table-expand-row-paddingbottom': { value: '16px', category: 'spacing', label: '展开行下内边距', usage: '表格展开行底部内边距' },
  'spacing-table-resizable-offset-y': { value: '4px', category: 'spacing', label: '拉伸垂直偏移', usage: '可拖动拉伸操作垂直偏移量' },
  'spacing-table-resizable-bottom': { value: '4px', category: 'spacing', label: '拉伸底部距离', usage: '可拖动拉伸操作底部距离' },
  'spacing-table-row-head-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '表头垂直内边距', usage: '表头垂直内边距' },
  'spacing-table-row-head-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '表头水平内边距', usage: '表头水平内边距' },
  'spacing-table-react-resizable-handle-right': { value: '-1px', category: 'spacing', label: '拉伸热区右偏移', usage: '可拖动拉伸操作向右偏移量' },
  'spacing-table-tbody-rowcell-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '表体单元格内边距', usage: '表格体单元格内边距（默认尺寸）' },
  'spacing-table-tbody-rowselection-rowcell-notselection-paddingx': { value: '16px', category: 'spacing', label: '选择行非选框列水平内边距', usage: '表格选择状态行（非复选框列）单元格水平内边距' },
  'spacing-table-tbody-rowselection-rowcell-notselection-paddingy': { value: '10px', category: 'spacing', label: '选择行非选框列垂直内边距', usage: '表格选择状态行（非复选框列）垂直内边距' },
  'spacing-table-column-sorter-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '排序按钮左外边距', usage: '表头标题与排序按钮间距' },
  'spacing-table-column-filter-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '过滤按钮左外边距', usage: '列过滤器按钮左侧外边距' },
  'spacing-table-bordered-titler-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '带边框标题左内边距', usage: '带边框表格标题左侧内边距' },
  'spacing-table-bordered-titler-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '带边框标题右内边距', usage: '带边框表格标题右侧内边距' },
  'spacing-table-expand-icon-marginright': { value: '8px', category: 'spacing', label: '展开按钮右外边距', usage: '行展开按钮右侧外边距' },
  'spacing-table-panel-operation-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '操作栏水平内边距', usage: '表格操作栏水平内边距' },
  'spacing-table-panel-operation-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '操作栏垂直内边距', usage: '表格操作栏垂直内边距' },

  // —— Size（宽度 / 高度）——
  'width-table-base-border': { value: '1px', category: 'width', label: '单元格分割线宽度', usage: '表格单元格分割线宽度' },
  'width-table-header-border': { value: '2px', category: 'width', label: '表头分割线宽度', usage: '表格表头分割线宽度' },
  'width-table-resizer-border': { value: '2px', category: 'width', label: '拉伸标示线宽度', usage: '表格拉伸列标示线宽度' },
  'width-table-column-selection': { value: '48px', category: 'width', label: '选择/展开列宽', usage: '表格选择列及展开列宽度' },
  'width-table-column-sorter-icon': { value: '16px', category: 'width', label: '排序按钮宽度', usage: '表格排序按钮宽度' },
  'height-table-column-sorter-icon': { value: '16px', category: 'height', label: '排序按钮高度', usage: '表格排序按钮高度' },
  'width-table-column-filter-icon': { value: '16px', category: 'width', label: '过滤按钮宽度', usage: '表格过滤按钮宽度' },
  'height-table-column-filter-icon': { value: '16px', category: 'height', label: '过滤按钮高度', usage: '表格过滤按钮高度' },
  'width-table-cell-fixed-left-last': { value: '1px', category: 'width', label: '左固定列右分割线宽度', usage: '表格左侧固定列右侧分割线宽度' },
  'width-table-cell-fixed-right-first': { value: '1px', category: 'width', label: '右固定列左分割线宽度', usage: '表格右侧固定列左侧分割线宽度' },
  'width-table-react-resizable-handle': { value: '9px', category: 'width', label: '伸缩列热区宽度', usage: '表格伸缩列调节热区宽度' },
  'height-table-pagination-outer-min': { value: '60px', category: 'height', label: '分页器高度', usage: '表格分页器高度' },
  'height-table-column-filter-dropdown': { value: '290px', category: 'height', label: '过滤列表最大高度', usage: '表格过滤筛选列表最大高度' },

  // —— Color ——
  'color-table-panel-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '操作区背景色', usage: '操作区域样式默认背景颜色' },
  'color-table-panel-text-default': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '操作栏选中文本色', usage: '表格操作栏选中项文本颜色' },
  'color-table-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '固定列/吸顶背景色', usage: '表格固定列及吸顶表头背景颜色' },
  'color-table-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '单元格文字色', usage: '单元格默认文字颜色' },
  'color-table-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '表格描边颜色' },
  'color-table-shadow-bg-default': { value: 'var(--cd-color-shadow)', category: 'color', label: '滚动阴影色', usage: '表格滚动后阴影颜色' },
  'color-table-shadow-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '拟阴影描边色', usage: '表格拟阴影 描边颜色' },
  'color-table-th-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '表头背景色', usage: '表头背景色' },
  'color-table-th-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '表头底部分割线色', usage: '表头底部分割线颜色' },
  'color-table-th-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '表头文字色', usage: '表头文字颜色' },
  'color-table-th-clicksort-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '点击排序悬浮背景色', usage: '点击表头触发排序背景色 - 悬浮' },
  'color-table-pl-bg-default': { value: 'transparent', category: 'color', label: 'placeholder 背景色', usage: '表格 placeholder 背景颜色' },
  'color-table-body-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '行背景色', usage: '表格行背景颜色 - 默认态' },
  'color-table-body-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '行悬浮背景色', usage: '表格行背景颜色 - 悬浮态' },
  'color-table-footer-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'footer 背景色', usage: '表格 footer 背景颜色 - 默认' },
  'color-table-row-expanded-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '展开行背景色', usage: '表格展开行背景颜色 - 默认' },
  'color-table-expanded-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '展开图标色', usage: '表格展开行图标颜色 - 默认' },
  'color-table-expanded-bg-default': { value: 'transparent', category: 'color', label: '展开图标容器背景色', usage: '表格展开行图标容器背景颜色 - 默认' },
  'color-table-disabled-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用背景色', usage: '表格禁用态背景颜色 - 默认' },
  'color-table-filter-on-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '过滤激活文字色', usage: '表格过滤按钮颜色 - 激活态' },
  'color-table-filter-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '过滤默认文字色', usage: '表格过滤按钮颜色 - 默认态' },
  'color-table-sorter-on-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '排序激活文字色', usage: '表格排序按钮颜色 - 激活态' },
  'color-table-sorter-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '排序默认文字色', usage: '表格排序按钮颜色 - 默认态' },
  'color-table-sorter-text-hover': { value: 'var(--cd-color-text-2)', category: 'color', label: '排序悬浮文字色', usage: '表格排序按钮颜色 - 悬浮态' },
  'color-table-page-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '翻页器文本色', usage: '表格翻页器文本颜色' },
  'color-table-resizer-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '拉伸标示线色', usage: '表格拉伸标示线颜色' },
  'color-table-selection-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '分组背景色', usage: '表格分组背景色（Semi 为 grey-0 = #f9f9f9，无 --cd-grey-0 alias，取语义最近 --cd-color-fill-0）' },
  'color-table-placeholder-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '空数据文本色', usage: '表格空数据文本颜色' },
  'color-table-cell-bg-hover': { value: 'var(--cd-color-bg-0)', category: 'color', label: '单元格悬浮背景色', usage: '让表格在 hover 时正确显示 body-bg-hover 颜色，如无必要不要修改' },

  // —— Other（字体 / 描边样式 / 阴影 / z-index）——
  'font-table-base-fontsize': { value: '14px', category: 'font', label: '默认文本字号', usage: '表格默认文本字号' },
  'border-table-base-borderstyle': { value: 'solid', category: 'other', label: '描边样式', usage: '表格描边样式' },
  'shadow-table-left': { value: '-3px 0 0 0 var(--cd-color-table-shadow-bg-default)', category: 'other', label: '滚动左阴影', usage: '表格滚动阴影 - 左侧' },
  'shadow-table-right': { value: '3px 0 0 0 var(--cd-color-table-shadow-bg-default)', category: 'other', label: '滚动右阴影', usage: '表格滚动阴影 - 右侧' },
  'z-table-fixed': { value: '101', category: 'other', label: '固定列层级', usage: 'fixed 列的 zIndex 值' },
  'z-table-fixed-column': { value: 'var(--cd-z-table-fixed)', category: 'other', label: '固定列层级', usage: 'fixed 列的 zIndex 值' },

  // —— chenzy-design Table 实际消费的补充 token（Semi 无；组件消费）——
  'table-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '表格背景色', usage: '表格整体背景（组件消费）' },
  'table-header-bg': { value: 'var(--cd-color-table-th-bg-default)', category: 'color', label: '表头背景色', usage: '表头背景（组件消费；转引 th-bg-default）' },
  'table-header-text': { value: 'var(--cd-color-table-th-text-default)', category: 'color', label: '表头文字色', usage: '表头文字（组件消费；转引 th-text-default）' },
  'table-cell-text': { value: 'var(--cd-color-table-text-default)', category: 'color', label: '单元格文字色', usage: '单元格文字（组件消费；转引 text-default）' },
  'table-border-color': { value: 'var(--cd-color-table-border-default)', category: 'color', label: '边框色', usage: '单元格分割线/边框（组件消费；转引 border-default）' },
  'table-row-hover-bg': { value: 'var(--cd-color-table-body-bg-hover)', category: 'color', label: '行悬浮背景色', usage: '行悬浮背景（组件消费；转引 body-bg-hover）' },
  'table-row-selected-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '行选中背景色', usage: '行选中背景（组件消费）' },
  'table-row-stripe-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '斑马纹背景色', usage: '斑马纹行背景（组件消费）' },
  'table-cell-padding-y': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '单元格垂直内边距', usage: '默认行单元格垂直内边距（组件消费；对齐 Semi tbody-rowCell-padding）' },
  'table-cell-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '单元格水平内边距', usage: '默认行单元格水平内边距（组件消费）' },
  'table-cell-padding-y-small': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小尺寸垂直内边距', usage: '小尺寸单元格垂直内边距（组件消费；转引 small-paddingY）' },
  'table-cell-padding-y-large': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '大尺寸垂直内边距', usage: '大尺寸单元格垂直内边距（组件消费）' },
  'table-cell-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '展开内容内边距', usage: '展开行内容区内边距（组件消费）' },
  'table-sort-active-color': { value: 'var(--cd-color-table-sorter-on-text-default)', category: 'color', label: '排序激活色', usage: '排序按钮激活色（组件消费；转引 sorter-on-text-default）' },
  'table-sort-icon-color': { value: 'var(--cd-color-table-sorter-text-default)', category: 'color', label: '排序图标色', usage: '排序/过滤图标默认色（组件消费；转引 sorter-text-default）' },
  'table-loading-mask': { value: 'var(--cd-color-bg-0)', category: 'color', label: '加载遮罩色', usage: '加载态遮罩背景（组件消费）' },
  'table-empty-color': { value: 'var(--cd-color-table-placeholder-text-default)', category: 'color', label: '空态文字色', usage: '空数据文本色（组件消费；转引 placeholder-text-default）' },
  'table-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '表格圆角', usage: '表格圆角（组件消费）' },
  'table-fixed-shadow': { value: 'rgba(0, 0, 0, 0.12)', category: 'color', label: '固定列边界阴影色', usage: '固定列边界渐变阴影色（组件消费）' },
} satisfies TokenGroup;
