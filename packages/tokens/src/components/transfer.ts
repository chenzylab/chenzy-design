/**
 * Component tokens for Transfer. 严格对齐 Semi Design
 * （semi-foundation/transfer/variables.scss）——名与值逐一镜像，无自造中间层。
 * 值引用我们的 alias / global token（var(--cd-*)）或字面量，与 Semi 的 var(--semi-*)
 * / 字面量一一对应。emit 后为 --cd-transfer-*。
 */
import type { TokenGroup } from './token-def.js';

export const transferTokens = {
  // —— Color —— （对齐 Semi $color-transfer* ）
  'color-transfer-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '穿梭框背景色', usage: '穿梭框背景颜色 - 默认' },
  'color-transfer-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '穿梭框描边颜色 - 默认' },
  'color-transfer-header-text': { value: 'var(--cd-color-text-2)', category: 'color', label: 'header 文字色', usage: '穿梭框 header 文字颜色' },
  'color-transfer-empty-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '空态文字色', usage: '穿梭框空状态文字颜色' },
  'color-transfer-group-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文字色', usage: '穿梭框分组标题文字颜色' },
  'color-transfer-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '穿梭框禁用文本文字颜色' },
  'color-transfer-close-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '穿梭框关闭按钮颜色' },
  'color-transfer-item-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '常规文字色', usage: '穿梭框常规文字颜色' },
  'color-transfer-selected-item-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中条目文字色', usage: '穿梭框选中条目文字颜色' },
  'color-transfer-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '条目悬浮背景色', usage: '穿梭框条目背景色 - 悬浮' },
  'color-transfer-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '条目按下背景色', usage: '穿梭框条目背景色 - 按下' },

  // —— Width / Height —— （对齐 Semi $width-transfer* / $height-transfer* ）
  'width-transfer-border': { value: '1px', category: 'width', label: '描边宽度', usage: '穿梭框描边宽度' },
  'width-transfer-min-width': { value: '402px', category: 'width', label: '整体最小宽度', usage: '穿梭框整体最小宽度' },
  'height-transfer': { value: '400px', category: 'height', label: '整体高度', usage: '穿梭框高度' },
  'height-transfer-header': { value: '24px', category: 'height', label: 'header 高度', usage: '穿梭框 header 高度' },
  'height-transfer-item-min-height': { value: '36px', category: 'height', label: '条目最小高度', usage: '穿梭框条目最小高度' },
  'width-transfer-item-close-icon': { value: 'var(--cd-width-icon-small)', category: 'width', label: '删除按钮宽度', usage: '穿梭框选中条目删除按钮宽度' },
  'width-transfer-left': { value: '50%', category: 'width', label: '左面板宽度', usage: '穿梭框左侧面板宽度' },
  'width-transfer-right': { value: '50%', category: 'width', label: '右面板宽度', usage: '穿梭框右侧面板宽度' },
  'height-transfer-left-empty': { value: '36px', category: 'height', label: '左空态高度', usage: '穿梭框空状态高度' },
  'width-transfer-left-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '分割线宽度', usage: '穿梭框双侧面板分割线宽度' },
  'height-transfer-right-header': { value: '32px', category: 'height', label: '右 header 高度', usage: '穿梭框右侧 header 高度' },
  'height-transfer-right-empty': { value: '100%', category: 'height', label: '右空态高度', usage: '穿梭框右侧空状态高度' },
  'width-transfer-empty': { value: '100%', category: 'width', label: '整体空态宽度', usage: '穿梭框整体空状态宽度' },
  'height-transfer-group-title': { value: '28px', category: 'height', label: '分组标题高度', usage: '穿梭框分组标题高度' },

  // —— Spacing —— （对齐 Semi $spacing-transfer* ）
  'spacing-transfer-header-margin-top': { value: '12px', category: 'spacing', label: 'header 上外边距', usage: '穿梭框 header 顶部外边距' },
  'spacing-transfer-header-margin-right': { value: '12px', category: 'spacing', label: 'header 右外边距', usage: '穿梭框 header 右侧外边距' },
  'spacing-transfer-header-margin-bottom': { value: '8px', category: 'spacing', label: 'header 下外边距', usage: '穿梭框 header 底部外边距' },
  'spacing-transfer-header-margin-left': { value: '12px', category: 'spacing', label: 'header 左外边距', usage: '穿梭框 header 左侧外边距' },
  'spacing-transfer-header-all-margin-left': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '全选按钮左外边距', usage: '穿梭框全选按钮左侧外边距' },
  'spacing-transfer-item-padding-top': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '条目上内边距', usage: '穿梭框条目顶部内边距' },
  'spacing-transfer-item-padding-right': { value: '9px', category: 'spacing', label: '条目右内边距', usage: '穿梭框条目右侧内边距' },
  'spacing-transfer-item-padding-bottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '条目下内边距', usage: '穿梭框条目底部内边距' },
  'spacing-transfer-item-padding-left': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '条目左内边距', usage: '穿梭框条目左侧内边距' },
  'spacing-transfer-right-header-margin-top': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '右 header 上外边距', usage: '穿梭框右侧面板 header 顶部外边距' },
  'spacing-transfer-right-header-margin-bottom': { value: '0', category: 'spacing', label: '右 header 下外边距', usage: '穿梭框右侧面板 header 底部外边距' },
  'spacing-transfer-right-item-drag-handler-margin-right': { value: '4px', category: 'spacing', label: '拖动图标右外边距', usage: '穿梭框拖动图标右侧外边距' },
  'spacing-transfer-filter-margin-top': { value: '12px', category: 'spacing', label: '搜索上外边距', usage: '穿梭框搜索顶部外边距' },
  'spacing-transfer-filter-margin-right': { value: '12px', category: 'spacing', label: '搜索右外边距', usage: '穿梭框搜索右侧外边距' },
  'spacing-transfer-filter-margin-bottom': { value: '0', category: 'spacing', label: '搜索下外边距', usage: '穿梭框搜索底部外边距' },
  'spacing-transfer-filter-margin-left': { value: '12px', category: 'spacing', label: '搜索左外边距', usage: '穿梭框搜索左侧外边距' },
  'spacing-transfer-group-title-padding-left': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '分组标题左内边距', usage: '穿梭框分组标题左侧内边距' },

  // —— Radius —— （对齐 Semi $radius-transfer ）
  'radius-transfer': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '圆角', usage: '穿梭框圆角' },

  // —— Font —— （对齐 Semi $font-transfer_header_all-fontWeight ）
  'font-transfer-header-all-font-weight': { value: '600', category: 'font', label: '全选按钮字重', usage: '穿梭框全选按钮字重' },
} satisfies TokenGroup;
