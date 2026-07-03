/**
 * Component tokens for Tree（M4 Show）。已按「Token 精简原则」清理孤儿：只保留组件真消费的
 * token。原「Semi 全量对齐」层里未被 svelte 消费、也不被别的 token 引用的语义 token 已删；
 * 仅作单一中间节点的语义 token（tree-node-* 引用的 color-tree-option-* 等）已内联其值后删除。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 保留 chenzy-design Tree 实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)。
 *  - Semi $font-weight-bold → var(--cd-font-weight-bold)；$width-icon-small →
 *    var(--cd-width-icon-small)；$spacing-* 字面量在 Semi tree 中直接写死 px，忠实保留。
 *  - var(--semi-border-radius-small) → var(--cd-border-radius-small)。
 *  - 组件 token 名（tree-node-* / tree-indent …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const treeTokens = {
  // —— Color（选项文字 / 图标 / 背景 / 状态） ——
  'color-tree-option-loading-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '加载图标色', usage: '树选项加载 spin 颜色' },
  'color-tree-option-draggable-insert-border-default': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽指示线色', usage: '树选项可拖拽插入指示线颜色' },

  // —— Radius ——
  'radius-tree-checkbox-addon': { value: 'var(--cd-border-radius-small)', category: 'radius', label: 'checkbox 圆角', usage: '多选树 checkbox 圆角' },

  // —— Width ——
  'width-tree-option-draggable-border': { value: '2px', category: 'width', label: '拖拽指示线宽度', usage: '可拖拽的树标示线宽度' },

  // —— chenzy-design Tree 实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费） ——
  // 行高：Semi tree 无显式行高 token（用 padding 撑），组件用固定行高 + 尺寸档，保留原名。
  'tree-node-height': { value: '32px', category: 'height', label: '行高', usage: '树行高 - 默认（组件消费）' },
  'tree-node-height-small': { value: '28px', category: 'height', label: '行高-小', usage: '树行高 - 小尺寸（组件消费）' },
  'tree-node-height-large': { value: '36px', category: 'height', label: '行高-大', usage: '树行高 - 大尺寸（组件消费）' },
  'tree-row-height': { value: 'var(--cd-tree-node-height)', category: 'height', label: '当前行高', usage: '当前尺寸行高基线（组件按 size 覆盖为 small/large；引 tree-node-height）' },
  // 缩进：对齐 Semi 选项缩进增量 20px。
  'tree-indent': { value: '20px', category: 'spacing', label: '层级缩进', usage: '每层缩进增量（组件消费；对齐 Semi 缩进增量 20px）' },
  'tree-node-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '节点水平内边距', usage: '树节点水平内边距（组件消费；TreeSelect/Cascader 下拉节点复用；收敛改名时遗漏，补回原值 base-tight）' },
  // 文字 / 图标色（引 Semi 语义 token）。
  'tree-node-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '文字字号', usage: '树选项文字字号（组件消费；对齐 Semi 常规正文 14px）' },
  'tree-node-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字色', usage: '树选项文字颜色（组件消费）' },
  'tree-node-color-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '禁用树选项文字颜色（组件消费）' },
  'tree-node-color-selected': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中文字色', usage: '树选中态深字（bg primary-light-default 区分，同 Menu；组件消费）' },
  'tree-expand-icon-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '展开图标色', usage: '展开/收起箭头颜色（组件消费）' },
  // 背景（引 Semi 语义 token）。
  'tree-node-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '悬停背景色', usage: '树选项悬停背景（组件消费）' },
  'tree-node-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '按下背景色', usage: '树选项按下背景（组件消费）' },
  'tree-node-bg-selected': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '选中背景色', usage: '树选项选中背景（组件消费）' },
  // 搜索高亮（引 Semi 高亮语义）：Semi tree 高亮无背景、primary 文字、bold。
  'tree-search-highlight-bg': { value: 'transparent', category: 'color', label: '高亮背景色', usage: 'Semi tree 高亮无背景（组件消费）' },
  'tree-search-highlight-color': { value: 'var(--cd-color-primary)', category: 'color', label: '高亮文本色', usage: '高亮文本 primary（组件消费）' },
  'tree-search-highlight-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '高亮字重', usage: '高亮字重 bold（组件消费）' },
  // 焦点环 / 边框 / 引导线 / checkbox 圆角。
  'tree-focus-ring': { value: 'var(--cd-color-primary)', category: 'color', label: '焦点环色', usage: '键盘焦点 / 拖拽指示线颜色（组件消费）' },
  'tree-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '边框色', usage: '搜索框边框色 - 默认（组件消费）' },
  'tree-border-color-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '边框色-警告', usage: '搜索框边框色 - warning（组件消费）' },
  'tree-border-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '边框色-错误', usage: '搜索框边框色 - error（组件消费）' },
  'tree-line-color': { value: 'var(--cd-color-border)', category: 'color', label: '引导线色', usage: 'showLine 层级引导线颜色（组件消费）' },
  'tree-radius': { value: 'var(--cd-radius-tree-checkbox-addon)', category: 'radius', label: '圆角', usage: '搜索框 / 行 / checkbox 圆角（组件消费；引 radius-tree-checkbox-addon）' },
} satisfies TokenGroup;
