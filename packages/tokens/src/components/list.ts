/**
 * Component tokens for List / Image / Highlight（M4 Show）。
 *
 * List 部分全量对齐 Semi Design（semi-foundation/list/variables.scss 16 个），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global
 * token，或字面量。末尾保留 chenzy-design List / ListItem 实际消费的补充 token
 * （原名，Semi 无 / 命名差异；组件消费），值改读上方 Semi 对齐 token。
 *
 * 注：
 *  - Semi 的 var(--semi-color-border) → var(--cd-color-border)；
 *    var(--semi-color-text-2) → var(--cd-color-text-2)。
 *  - Semi $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；
 *    $spacing-loose → var(--cd-spacing-loose)（24px）；$spacing-tight →
 *    var(--cd-spacing-tight)（8px）；$spacing-base → var(--cd-spacing-base)（16px）；
 *    $spacing-base-loose → var(--cd-spacing-base-loose)（20px）；
 *    $spacing-super-loose → var(--cd-spacing-super-loose)（40px）。0px 字面量保留。
 *  - 组件 token 名（list-* / color-list-* / spacing-list-* …）与 alias / global 层
 *    不同名，var() 无自引用死循环。
 *  - Image / Highlight token 供 image/ 与 highlight/ 组件消费，保持原样不变。
 */
import type { TokenGroup } from './token-def.js';

export const listTokens = {
  // —— List：全量对齐 Semi list/variables.scss（16 个） ——
  'color-list-default-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '列表描边颜色', usage: '列表描边颜色' },
  'color-list-empty-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '空状态列表文字颜色', usage: '空状态下列表文字颜色' },

  'spacing-list-empty-paddingx': { value: '0px', category: 'spacing', label: '空状态水平内边距', usage: '空状态列表水平内边距' },
  'spacing-list-empty-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '空状态垂直内边距', usage: '空状态列表垂直内边距' },
  'spacing-list-footer-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 水平内边距', usage: '列表 footer 水平内边距' },
  'spacing-list-footer-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'footer 垂直内边距', usage: '列表 footer 垂直内边距' },
  'spacing-list-item-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'item 水平内边距', usage: '列表 item 水平内边距 - 默认尺寸' },
  'spacing-list-item-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'item 垂直内边距', usage: '列表 item 垂直内边距 - 默认尺寸' },
  'spacing-list-small-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'item 水平内边距 - 小', usage: '列表 item 水平内边距 - 小尺寸' },
  'spacing-list-small-paddingy': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'item 垂直内边距 - 小', usage: '列表 item 垂直内边距 - 小尺寸' },
  'spacing-list-large-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'item 水平内边距 - 大', usage: '列表 item 水平内边距 - 大尺寸' },
  'spacing-list-large-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'item 垂直内边距 - 大', usage: '列表 item 垂直内边距 - 大尺寸' },

  'spacing-list-header-marginright': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: 'header 右外边距', usage: '列表 header 右侧外边距' },
  'spacing-list-header-marginleft': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: 'header 左外边距', usage: '列表 header 左侧外边距' },
  'spacing-list-extra-marginleft': { value: 'var(--cd-spacing-super-loose)', category: 'spacing', label: 'extra 左外边距', usage: '列表 extra 额外内容左侧外边距' },
  'spacing-list-extra-marginright': { value: 'var(--cd-spacing-super-loose)', category: 'spacing', label: 'extra 右外边距', usage: '列表 extra 额外内容右侧外边距' },

  // —— chenzy-design List / ListItem 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'list-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '列表背景色', usage: '列表容器背景（组件消费）' },
  'list-border': { value: 'var(--cd-color-list-default-border-default)', category: 'color', label: '列表边框色', usage: '列表外框描边（组件消费）' },
  'list-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '列表圆角', usage: 'bordered 列表圆角（组件消费）' },
  'list-item-padding': { value: 'var(--cd-spacing-list-item-paddingy) var(--cd-spacing-list-item-paddingx)', category: 'spacing', label: 'item 内边距', usage: '列表项内边距 - 默认（组件消费）' },
  'list-item-padding-small': { value: 'var(--cd-spacing-list-small-paddingy) var(--cd-spacing-list-small-paddingx)', category: 'spacing', label: 'item 内边距 - 小', usage: '列表项内边距 - 小尺寸（组件消费）' },
  'list-split-color': { value: 'var(--cd-color-list-default-border-default)', category: 'color', label: '分隔线颜色', usage: '列表行间分隔线颜色（组件消费）' },
  'list-header-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'header 文字色', usage: '列表 header 文字颜色（组件消费）' },
  'list-item-color': { value: 'var(--cd-color-text-1)', category: 'color', label: 'item 文字色', usage: '列表项文字颜色（组件消费）' },

  // Image
  'image-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '图片背景色', usage: '图片占位背景' },
  'image-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '图片圆角', usage: 'Semi $radius-image = small（原 medium）' },
  'image-placeholder-color': { value: 'var(--cd-color-text-3)', category: 'color', label: '占位符颜色', usage: '图片占位/错误文字颜色' },
  'image-mask-bg': { value: 'rgba(0, 0, 0, 0.5)', category: 'color', label: '遮罩背景色', usage: '图片操作遮罩背景' },
  'image-mask-color': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '遮罩文字色', usage: '图片操作遮罩文字颜色' },
  'image-mask-hover-bg': { value: 'rgba(255, 255, 255, 0.15)', category: 'color', label: '遮罩控件 hover 底', usage: '预览工具条/切换按钮 hover 时的浅色高亮叠层（浮在深色遮罩上）' },
  'image-preview-overlay': { value: 'rgba(0, 0, 0, 0.7)', category: 'color', label: '预览遮罩色', usage: '预览层背景遮罩' },
  'image-preview-z': { value: 'var(--cd-z-modal)', category: 'other', label: '预览层级', usage: '预览层 z-index' },

  // Highlight（镜像 Semi：黄底黑字 + 字重 600）
  'highlight-bg': { value: 'var(--cd-color-highlight-bg)', category: 'color', label: '高亮背景色', usage: '高亮命中文字背景' },
  'highlight-color': { value: 'var(--cd-color-highlight)', category: 'color', label: '高亮文字色', usage: '高亮命中文字颜色' },
  'highlight-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '高亮字重', usage: '高亮命中文字字重' },
} satisfies TokenGroup;
