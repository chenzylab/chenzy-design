/**
 * Component tokens for List / Image（M4 Show）。
 *
 * List 部分严格对齐 Semi Design（semi-foundation/list/variables.scss，16 个），
 * 一比一镜像 token 名与值（category/label/usage 元数据用于 DSM）。值为 var() 引用
 * 我们的 alias / global token，或字面量，与 Semi 原始 $ 变量语义逐一对应。
 *
 * 破坏性对齐（无向后兼容）：移除了 Semi List 不存在的中间/补充 token——
 *  - list-bg（Semi 列表容器透明无背景）
 *  - list-radius（Semi bordered 仅描边、无圆角）
 *  - list-header-color / list-item-color（Semi 列表文字继承 body，无专用色）
 *  - list-item-padding / list-item-padding-small（复合简写，组件改直接消费
 *    spacing-list-item-* / spacing-list-small-* 原子 token，与 Semi scss 同粒度）
 *  - list-border / list-split-color（组件改直接消费 color-list-default-border-default，
 *    与 Semi scss 用同一个描边色 token，不再引入别名中间层）
 *
 * 注：
 *  - Semi var(--semi-color-border) → var(--cd-color-border)；
 *    var(--semi-color-text-2) → var(--cd-color-text-2)。
 *  - Semi $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；
 *    $spacing-loose → var(--cd-spacing-loose)（24px）；$spacing-tight →
 *    var(--cd-spacing-tight)（8px）；$spacing-base → var(--cd-spacing-base)（16px）；
 *    $spacing-base-loose → var(--cd-spacing-base-loose)（20px）；
 *    $spacing-super-loose → var(--cd-spacing-super-loose)（40px）。0px 字面量保留。
 *  - Image token 供 image/ 组件消费，保持原样不变。
 */
import type { TokenGroup } from './token-def.js';

export const listTokens = {
  // —— List：严格对齐 Semi list/variables.scss（16 个，名/值一比一镜像） ——
  'color-list-default-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '列表描边颜色', usage: '列表描边颜色（$color-list_default-border-default）' },
  'color-list-empty-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '空状态列表文字颜色', usage: '空状态下列表文字颜色（$color-list_empty-text-default）' },

  'spacing-list-empty-paddingx': { value: '0px', category: 'spacing', label: '空状态水平内边距', usage: '空状态列表水平内边距（$spacing-list_empty-paddingX）' },
  'spacing-list-empty-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '空状态垂直内边距', usage: '空状态列表垂直内边距（$spacing-list_empty-paddingY）' },
  'spacing-list-footer-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 水平内边距', usage: '列表 footer 水平内边距（$spacing-list_footer-paddingX）' },
  'spacing-list-footer-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'footer 垂直内边距', usage: '列表 footer 垂直内边距（$spacing-list_footer-paddingY）' },
  'spacing-list-item-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'item 水平内边距', usage: '列表 item 水平内边距 - 默认尺寸（$spacing-list_item-paddingX）' },
  'spacing-list-item-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'item 垂直内边距', usage: '列表 item 垂直内边距 - 默认尺寸（$spacing-list_item-paddingY）' },
  'spacing-list-small-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'item 水平内边距 - 小', usage: '列表 item 水平内边距 - 小尺寸（$spacing-list_small-paddingX）' },
  'spacing-list-small-paddingy': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'item 垂直内边距 - 小', usage: '列表 item 垂直内边距 - 小尺寸（$spacing-list_small-paddingY）' },
  'spacing-list-large-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'item 水平内边距 - 大', usage: '列表 item 水平内边距 - 大尺寸（$spacing-list_large-paddingX）' },
  'spacing-list-large-paddingy': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'item 垂直内边距 - 大', usage: '列表 item 垂直内边距 - 大尺寸（$spacing-list_large-paddingY）' },

  'spacing-list-header-marginright': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: 'header 右外边距', usage: '列表项 header 右侧外边距（$spacing-list_header-marginRight）' },
  'spacing-list-header-marginleft': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: 'header 左外边距', usage: '列表项 header 左侧外边距 - RTL（$spacing-list_header-marginLeft）' },
  'spacing-list-extra-marginleft': { value: 'var(--cd-spacing-super-loose)', category: 'spacing', label: 'extra 左外边距', usage: '列表项 extra 额外内容左侧外边距（$spacing-list_extra-marginLeft）' },
  'spacing-list-extra-marginright': { value: 'var(--cd-spacing-super-loose)', category: 'spacing', label: 'extra 右外边距', usage: '列表项 extra 额外内容右侧外边距 - RTL（$spacing-list_extra-marginRight）' },

  // Image
  'image-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '图片背景色', usage: '图片占位背景' },
  'image-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '图片圆角', usage: 'Semi $radius-image = small（原 medium）' },
  'image-placeholder-color': { value: 'var(--cd-color-text-3)', category: 'color', label: '占位符颜色', usage: '图片占位/错误文字颜色' },
  'image-mask-bg': { value: 'rgba(0, 0, 0, 0.5)', category: 'color', label: '遮罩背景色', usage: '图片操作遮罩背景' },
  'image-mask-color': { value: 'var(--cd-color-white)', category: 'color', label: '遮罩文字色', usage: '图片操作遮罩文字颜色' },
  'image-mask-hover-bg': { value: 'rgba(255, 255, 255, 0.15)', category: 'color', label: '遮罩控件 hover 底', usage: '预览工具条/切换按钮 hover 时的浅色高亮叠层（浮在深色遮罩上）' },
  'image-preview-overlay': { value: 'rgba(0, 0, 0, 0.7)', category: 'color', label: '预览遮罩色', usage: '预览层背景遮罩' },
  'image-preview-z': { value: 'var(--cd-z-modal)', category: 'other', label: '预览层级', usage: '预览层 z-index' },
} satisfies TokenGroup;
