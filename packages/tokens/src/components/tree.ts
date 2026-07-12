/**
 * Component tokens for Tree（M4 Show）——严格对齐 Semi `semi-foundation/tree/variables.scss`。
 *
 * 对齐原则（无向后兼容包袱）：
 *  - 每个 token 的**名与值**都对应 Semi variables.scss 里的 `$xxx`（Semi `-`/`_` 混用 → 统一转 kebab）。
 *  - Semi 的 `var(--semi-color-*)` 一一对应我们的 `var(--cd-color-*)`；`$width-icon-small` →
 *    `var(--cd-width-icon-small)`；`$font-weight-bold` → `var(--cd-font-weight-bold)`；
 *    `$border-radius-small` → `var(--cd-border-radius-small)`。
 *  - Semi 中写死的 px 间距忠实映射到我们同值的 spacing 别名：12px→base-tight、8px→tight、
 *    4px→extra-tight、2px→super-tight、20px→base-loose。
 *  - 不再保留任何「组件不消费、也不被其它 token 引用」的孤儿中间变量；组件样式直接消费下列 token。
 *  - 行高（node-height / size 档）Semi 无对应 token（用 padding 撑高），属本库补充档，保留原名并注明。
 */
import type { TokenGroup } from './token-def.js';

export const treeTokens = {
  // ============================================================
  // Color —— 对齐 Semi variables.scss 的 $color-tree_option-*
  // ============================================================
  'color-tree-option-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '选项文字色', usage: '树选项文字颜色（$color-tree_option-text-default）' },
  'color-tree-option-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '选项图标色', usage: '展开箭头 / 节点图标颜色（$color-tree_option-icon-default）' },
  'color-tree-option-icon-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色-悬停', usage: '展开图标悬停色（$color-tree_option-icon-hover）' },
  'color-tree-option-icon-active': { value: 'var(--cd-color-black)', category: 'color', label: '图标色-按下', usage: '展开图标按下色（$color-tree_option-icon-active）' },
  'color-tree-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '选项背景-悬停', usage: '树选项悬停背景（$color-tree_option-bg-hover）' },
  'color-tree-option-selected-bg-default': { value: 'var(--cd-color-fill-1)', category: 'color', label: '选项背景-按下', usage: '树选项按下背景（$color-tree_option_selected-bg-default）' },
  'color-tree-option-bg-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '选项背景-选中', usage: '树选项选中/激活背景（$color-tree_option-bg-active）' },
  'color-tree-option-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '禁用树选项文字颜色（$color-tree_option_disabled-text-default）' },
  'color-tree-option-loading-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '加载图标色', usage: '树选项加载 spin 颜色（$color-tree_option_loading-icon-default）' },
  'color-tree-option-draggable-insert-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽指示线色', usage: '可拖拽插入指示线颜色（$color-tree_option_draggable_insert-border-default）' },
  'color-tree-option-highlight-text': { value: 'var(--cd-color-primary)', category: 'color', label: '高亮文本色', usage: '搜索命中高亮文本色（$color-tree_option_hightlight-text）' },

  // ============================================================
  // Font —— $font-tree_option_hightlight-fontWeight
  // ============================================================
  'font-tree-option-highlight-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '高亮字重', usage: '搜索命中高亮字重 bold（$font-tree_option_hightlight-fontWeight）' },

  // ============================================================
  // Radius —— $radius-tree_checkbox_addon
  // ============================================================
  'radius-tree-checkbox-addon': { value: 'var(--cd-border-radius-small)', category: 'radius', label: 'checkbox 圆角', usage: '多选树 checkbox / 选项标签圆角（$radius-tree_checkbox_addon）' },

  // ============================================================
  // Spacing —— 对齐 Semi 的 px 间距（忠实映射到同值 spacing 别名）
  // ============================================================
  'spacing-tree-search-wrapper-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '搜索框水平内边距', usage: '搜索框容器水平 padding 12px（$spacing-tree_search_wrapper-paddingX）' },
  'spacing-tree-search-wrapper-padding-y': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '搜索框垂直内边距', usage: '搜索框容器垂直 padding 8px（$spacing-tree_search_wrapper-paddingY）' },
  'spacing-tree-option-level-padding-left': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '层级缩进增量', usage: '每层缩进增量 20px（$spacing-tree_option_level-paddingLeft）' },
  'spacing-tree-option-level1-padding-left': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '首层左内边距', usage: '选项最上层左侧内边距 8px（$spacing-tree_option_level1-paddingLeft）' },
  'spacing-tree-option-list-padding-x': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '选项列表水平内边距', usage: '选项列表水平 padding 0（$spacing-tree_optionList-paddingX）' },
  'spacing-tree-option-list-padding-y': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项列表垂直内边距', usage: '选项列表垂直 padding 8px（$spacing-tree_optionList-paddingY）' },
  'spacing-tree-icon-margin-right': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右外边距', usage: '展开箭头 / 图标右侧 margin 8px（$spacing-tree_icon-marginRight）' },
  'spacing-tree-label-with-icon-margin-right': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'label 图标右外边距', usage: 'label 内图标 / checkbox 右侧 margin 8px（$spacing-tree_label_withIcon-marginRight）' },
  'spacing-tree-option-draggable-padding-y': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '可拖拽选项垂直内边距', usage: '可拖拽选项 label 垂直 padding 2px（$spacing-tree_option_draggable-paddingY）' },
  'spacing-tree-option-draggable-padding-x': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '可拖拽选项水平内边距', usage: '可拖拽选项 label 水平 padding 0（$spacing-tree_option_draggable-paddingX）' },

  // ============================================================
  // Width —— 对齐 Semi 的 $width-tree_*
  // ============================================================
  'width-tree-empty-icon': { value: 'var(--cd-width-icon-small)', category: 'width', label: '展开图标宽度', usage: '展开箭头 / 空图标宽度 12px（$width-tree_emptyIcon）' },
  'width-tree-spin-icon': { value: 'var(--cd-width-icon-small)', category: 'width', label: '加载图标宽度', usage: '加载 spin 宽度 12px（$width-tree_spinIcon）' },
  'width-tree-option-draggable-border': { value: '2px', category: 'width', label: '拖拽指示线宽度', usage: '可拖拽插入指示线宽度 2px（$width-tree_option_draggable-border）' },
  'width-tree-option-line': { value: '1px', category: 'width', label: '连接线宽度', usage: 'showLine 连接线宽度 1px（$width-tree_option_line）' },
  'color-tree-option-line': { value: 'var(--cd-color-text-3)', category: 'color', label: '连接线色', usage: 'showLine 连接线颜色（Semi 用 --semi-color-text-3）' },

  // ============================================================
  // 补充档：行高 / 字号 / 状态边框 —— Semi tree 无对应 token（用 padding 撑高、
  //   搜索框边框复用 Input），属本库补充；组件消费。
  // ============================================================
  'tree-node-height': { value: '32px', category: 'height', label: '行高', usage: '树行高 - 默认（本库补充；Semi 无行高 token）' },
  'tree-node-height-small': { value: '28px', category: 'height', label: '行高-小', usage: '树行高 - 小尺寸（本库补充）' },
  'tree-node-height-large': { value: '36px', category: 'height', label: '行高-大', usage: '树行高 - 大尺寸（本库补充）' },
  'tree-row-height': { value: 'var(--cd-tree-node-height)', category: 'height', label: '当前行高', usage: '当前尺寸行高基线（组件按 size 覆盖为 small/large）' },
  'tree-node-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '文字字号', usage: '树选项文字字号（对齐 Semi font-size-regular 14px）' },
  'tree-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '焦点环色', usage: '键盘焦点环颜色（本库补充；Semi 无键盘 roving 焦点环）' },
  // 下拉面板节点水平内边距：TreeSelect / Cascader 下拉行复用（Semi tree 选项无独立水平 padding
  // token，下拉浮层节点需要，故保留本库补充 token，值 12px = base-tight）。
  'tree-node-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '下拉节点水平内边距', usage: 'TreeSelect / Cascader 下拉节点水平内边距（本库补充）' },
} satisfies TokenGroup;
