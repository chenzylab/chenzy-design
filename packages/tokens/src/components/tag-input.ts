/**
 * Component tokens for TagInput. 全量对齐 Semi Design（semi-foundation/tagInput/variables.scss
 * 60 行），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design TagInput 实际消费的补充 token（Semi 无；标签/删除/清除等）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$height-control-*` → 我们 `var(--cd-control-height-*)`（scales.sizing 无 category 前缀）。
 * - Semi `$width-icon-medium` → 我们 `var(--cd-width-icon-medium)`。
 * - Semi `$border-thickness-control` / `-control-focus` → 我们同名 `var(--cd-border-thickness-control[-focus])`。
 * - Semi `$spacing-super-tight/-tight/-base-tight` → 我们 `var(--cd-spacing-super-tight/-tight/-base-tight)`。
 * - Semi `$font-weight-bold` → 我们 `var(--cd-font-weight-bold)`。
 * - Semi `var(--semi-border-radius-small)` → 我们 `var(--cd-border-radius-small)`。
 * - Semi `$z-tagInput_drag_item_move: 2000` → 我们已有 `var(--cd-z-drag)`（= 2000）。
 * - 废弃项（line 16 注释掉的 deprecated）不纳入。
 */
import type { TokenGroup } from './token-def.js';

export const tagInputTokens = {
  // —— icon / maxTagCount / prefix / suffix / handler 颜色 ——
  'color-tag-input-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '标签输入框图标颜色 - 默认' },
  'color-tag-input-maxtagcount-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '限制数量文字色', usage: '标签输入框限制标签展示数量文字颜色' },
  'color-tag-input-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '图标色', usage: '标签输入框图标颜色 - 悬浮' },
  'color-tag-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '标签输入框禁用文字颜色' },
  'color-tag-input-disabled-bg': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '标签输入框禁用背景色' },
  'color-tag-input-default-bg-focus': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 选中态' },

  // —— border ——
  'color-tag-input-border-default': { value: 'transparent', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 默认' },
  'color-tag-input-border-hover': { value: 'transparent', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 悬浮' },
  'color-tag-input-border-focus': { value: 'var(--cd-color-focus-border)', category: 'color', label: '描边色', usage: '标签输入框描边颜色 - 选中态' },
  'color-tag-input-prefix-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 色', usage: '标签输入框 prefix 颜色' },
  'color-tag-input-suffix-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'suffix 色', usage: '标签输入框 suffix 颜色' },

  // —— default 背景 ——
  'color-tag-input-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 默认' },
  'color-tag-input-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '背景色', usage: '标签输入框背景颜色 - 悬浮' },

  // —— warning ——
  'color-tag-input-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 默认' },
  'color-tag-input-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 默认' },
  'color-tag-input-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 悬浮' },
  'color-tag-input-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 悬浮' },
  'color-tag-input-warning-bg-focus': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '警告标签输入框背景颜色 - 选中' },
  'color-tag-input-warning-border-focus': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色', usage: '警告标签输入框描边颜色 - 选中' },

  // —— danger ——
  'color-tag-input-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 默认' },
  'color-tag-input-danger-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 默认' },
  'color-tag-input-danger-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 悬浮' },
  'color-tag-input-danger-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 悬浮' },
  'color-tag-input-danger-bg-focus': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '危险背景色', usage: '危险标签输入框背景颜色 - 选中' },
  'color-tag-input-danger-border-focus': { value: 'var(--cd-color-danger)', category: 'color', label: '危险描边色', usage: '危险标签输入框描边颜色 - 选中' },
  'color-tag-input-sortable-item-over-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽指示线色', usage: '拖拽经过的元素前竖线背景色' },
  'color-tag-input-prefix-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'prefix 文字色', usage: '标签输入框 prefix 文字颜色' },
  'color-tag-input-handler-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '拖拽手柄色', usage: '可拖拽的标签拖拽按钮颜色' },

  // —— spacing ——
  'spacing-tag-input-small-y': { value: '1px', category: 'spacing', label: '小尺寸标签上外边距', usage: '小尺寸标签输入框标签顶部外边距' },
  'spacing-tag-input-default-y': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '默认标签上外边距', usage: '默认尺寸标签输入框标签顶部外边距' },
  'spacing-tag-input-large-y': { value: '3px', category: 'spacing', label: '大尺寸标签上外边距', usage: '大尺寸标签输入框标签顶部外边距' },
  'spacing-tag-input-wrapper-n-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签容器水平内边距', usage: '标签输入框标签容器水平内边距' },
  'spacing-tag-input-drag-handler-marginright': { value: '4px', category: 'spacing', label: '拖拽手柄右外边距', usage: '拖拽 handler icon 的右外边距' },
  'spacing-tag-input-tag-icon-paddingleft': { value: '4px', category: 'spacing', label: '带手柄标签左内边距', usage: 'tag 中有 handler icon 时 tag 的左内边距' },
  'spacing-tag-input-prefix-suffix-marginx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'prefix/suffix 水平外边距', usage: '标签输入框 prefix/suffix 水平外边距' },

  // —— height ——
  'height-tag-input-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '大尺寸高度', usage: '大尺寸标签输入框高度' },
  'height-tag-input-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '默认尺寸高度', usage: '默认尺寸标签输入框高度' },
  'height-tag-input-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '小尺寸高度', usage: '小尺寸标签输入框高度' },
  'height-tag-input-input-small': { value: '20px', category: 'height', label: '小尺寸输入框高度', usage: '小尺寸标签输入框 Input 框高度' },
  'height-tag-input-input-default': { value: '24px', category: 'height', label: '默认尺寸输入框高度', usage: '默认尺寸标签输入框 Input 框高度' },
  'height-tag-input-input-large': { value: '24px', category: 'height', label: '大尺寸输入框高度', usage: '大尺寸标签输入框 Input 框高度' },

  // —— width ——
  'width-tag-input-clear-medium': { value: 'calc(var(--cd-width-icon-medium) * 2)', category: 'width', label: '清空按钮宽度', usage: '标签输入框清空按钮宽度' },
  'width-tag-input-border-default': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '描边宽度', usage: '标签输入框描边宽度 - 默认' },
  'width-tag-input-border-hover': { value: 'var(--cd-width-tag-input-border-default)', category: 'width', label: '描边宽度', usage: '标签输入框描边宽度 - 悬浮' },
  'width-tag-input-border-focus': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '描边宽度', usage: '标签输入框描边宽度 - 选中态' },
  'width-tag-input-sortable-item-over': { value: '2px', category: 'width', label: '拖拽指示线宽度', usage: '拖拽经过的元素前竖线宽度' },

  // —— radius ——
  'radius-tag-input': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角', usage: '标签输入框圆角' },

  // —— z-index（对齐 Semi $z-tagInput_drag_item_move: 2000；复用我们 --cd-z-drag = 2000）——
  'z-tag-input-drag-item-move': { value: 'var(--cd-z-drag)', category: 'other', label: '拖拽元素层级', usage: '标签输入框中正在拖拽元素的 z-index' },

  // —— font ——
  'font-tag-input-prefix-suffix-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'prefix/suffix 字重', usage: '标签输入框 prefix/suffix 文字字重' },

  // —— chenzy-design TagInput 实际消费的补充 token（Semi 无；组件消费） ——
  // 容器复用 Input 填充式 token（背景 / 描边 / 圆角 / 内边距 / 状态描边），此处仅补 TagInput 独有的标签 + 删除 + 清除。
  'tag-input-tag-bg': { value: 'var(--cd-color-tag-input-default-bg-hover)', category: 'color', label: '标签背景色', usage: '内部标签背景颜色（组件消费）' },
  'tag-input-tag-radius': { value: 'var(--cd-radius-tag-input)', category: 'radius', label: '标签圆角', usage: '内部标签圆角（组件消费）' },
  'tag-input-tag-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '标签字号', usage: '内部标签文字字号（组件消费）' },
  'tag-input-tag-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标签内元素间距', usage: '标签内文字与删除按钮间距（组件消费）' },
  'tag-input-tag-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签水平内边距', usage: '内部标签水平内边距（组件消费）' },
  'tag-input-remove-color': { value: 'var(--cd-color-tag-input-icon-default)', category: 'color', label: '删除按钮色', usage: '标签删除按钮颜色（组件消费）' },
  'tag-input-remove-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '删除按钮悬浮色', usage: '标签删除按钮颜色 - 悬浮（组件消费）' },
  'tag-input-clear-color': { value: 'var(--cd-color-tag-input-icon-default)', category: 'color', label: '清除按钮色', usage: '清除全部按钮颜色（组件消费）' },
  'tag-input-clear-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '清除按钮悬浮色', usage: '清除全部按钮颜色 - 悬浮（组件消费）' },
} satisfies TokenGroup;
