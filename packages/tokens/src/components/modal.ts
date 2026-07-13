/**
 * Component tokens for Modal（M5 Feedback）。严格镜像 Semi Design
 * @douyinfe/semi-foundation/modal/variables.scss —— 逐条对齐 Semi 变量名与值，
 * 仅将 Semi 的 `$color-modal_mask-bg` 下划线命名转为本库 kebab-case
 * `color-modal-mask-bg`，值一一对应（var(--semi-color-*) → var(--cd-color-*)）。
 * 不再保留本库自造的中间 token（modal-padding / modal-header-gap 等 Semi 无者已移除）。
 *
 * 对应关系：
 *  - var(--semi-color-*)          → var(--cd-color-*)
 *  - $spacing-base-tight          → var(--cd-spacing-base-tight)（12px）
 *  - $font-size-regular           → var(--cd-font-size-regular)
 *  - $font-weight-bold            → var(--cd-font-weight-bold)
 *  - $width-icon-extra-large      → var(--cd-width-icon-extra-large)
 *  - var(--semi-border-radius-large) → var(--cd-border-radius-large)
 *  - var(--semi-shadow-elevated)  → var(--cd-shadow-elevated)
 */
import type { TokenGroup } from './token-def.js';

export const modalTokens = {
  // —— Color（对齐 $color-modal_*）——
  'color-modal-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '模态框背景颜色', usage: '模态框背景颜色' },
  'color-modal-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '模态框蒙层颜色', usage: '模态框蒙层颜色' },
  'color-modal-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '模态框文字颜色', usage: '模态框文字颜色' },
  'color-modal-info-icon': { value: 'var(--cd-color-info)', category: 'color', label: '信息图标颜色', usage: '模态框信息图标颜色' },
  'color-modal-primary-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '主要图标颜色', usage: '模态框主要图标颜色' },
  'color-modal-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标颜色', usage: '模态框成功图标颜色' },
  'color-modal-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '危险图标颜色', usage: '模态框危险图标颜色' },
  'color-modal-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标颜色', usage: '模态框警告图标颜色' },
  'color-modal-content-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边颜色', usage: '模态框描边颜色' },
  'color-modal-header-bg': { value: 'transparent', category: 'color', label: 'header 背景色', usage: '模态框 header 背景填充色' },
  'color-modal-footer-bg': { value: 'transparent', category: 'color', label: 'footer 背景色', usage: '模态框 footer 背景填充色' },
  'color-modal-header-border': { value: 'transparent', category: 'color', label: 'header 底部描边色', usage: '模态框 header 底部描边颜色' },
  'color-modal-footer-border': { value: 'transparent', category: 'color', label: 'footer 顶部描边色', usage: '模态框 footer 顶部描边颜色' },

  // —— Spacing（对齐 $spacing-modal_*）——
  'spacing-modal-marginy': { value: '80px', category: 'spacing', label: '距顶外边距', usage: '模态框距容器顶部外边距' },
  'spacing-modal-marginx': { value: 'auto', category: 'spacing', label: '水平外边距', usage: '模态框水平外边距（默认居中）' },
  'spacing-modal-content-withicon-marginleft': { value: '36px', category: 'spacing', label: '带图标内容左外边距', usage: '模态框带图标时内容左外边距' },
  'spacing-modal-icon-wrapper-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标右外边距', usage: '模态框图标右侧外边距' },
  'spacing-modal-content-paddingy': { value: '0', category: 'spacing', label: '内容垂直内边距', usage: '模态框内容垂直内边距' },
  'spacing-modal-content-paddingx': { value: '24px', category: 'spacing', label: '内容水平内边距', usage: '模态框内容水平内边距' },
  'spacing-modal-header-marginy': { value: '24px', category: 'spacing', label: 'header 垂直外边距', usage: '模态框标题垂直外边距' },
  'spacing-modal-header-marginx': { value: '0', category: 'spacing', label: 'header 水平外边距', usage: '模态框标题水平外边距' },
  'spacing-modal-body-wrapper-marginy': { value: '24px', category: 'spacing', label: 'body-wrapper 垂直外边距', usage: '模态框无标题内容包裹垂直外边距' },
  'spacing-modal-body-wrapper-marginx': { value: '0', category: 'spacing', label: 'body-wrapper 水平外边距', usage: '模态框无标题内容包裹水平外边距' },
  'spacing-modal-footer-marginy': { value: '24px', category: 'spacing', label: 'footer 垂直外边距', usage: '模态框 footer 垂直外边距' },
  'spacing-modal-footer-marginx': { value: '0', category: 'spacing', label: 'footer 水平外边距', usage: '模态框 footer 水平外边距' },
  'spacing-modal-footer-button-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 按钮左外边距', usage: '模态框 footer 按钮左侧外边距' },
  'spacing-modal-confirm-header-marginbottom': { value: '8px', category: 'spacing', label: '命令式 header 底外边距', usage: '命令式调用模态框 header 底部外边距' },
  'spacing-modal-confirm-icon-wrapper-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '命令式图标右外边距', usage: '命令式调用模态框图标右侧外边距' },
  'spacing-modal-content-fullscreen-top': { value: '0px', category: 'spacing', label: '全屏内容顶部位置', usage: '模态框内容全屏顶部位置' },

  // —— Width/Height（对齐 $width-modal_*）——
  'width-modal-content-border': { value: '1px', category: 'other', label: '内容描边宽度', usage: '模态框内容描边宽度' },
  'width-modal-small': { value: '448px', category: 'other', label: '小尺寸宽度', usage: '模态框宽度 - 小' },
  'width-modal-medium': { value: '684px', category: 'other', label: '中尺寸宽度', usage: '模态框宽度 - 中' },
  'width-modal-large': { value: '920px', category: 'other', label: '大尺寸宽度', usage: '模态框宽度 - 大' },
  'width-modal-full-width': { value: 'calc(100vw - 64px)', category: 'other', label: '全宽宽度', usage: '模态框宽度 - 全宽' },
  'height-modal-content': { value: 'max-content', category: 'other', label: '内容高度', usage: '模态框内容高度' },

  // —— Radius（对齐 $radius-modal_*）——
  'radius-modal-content': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '内容圆角', usage: '模态框圆角大小' },
  'radius-modal-content-fullscreen': { value: '0', category: 'radius', label: '全屏圆角', usage: '模态框圆角大小 - 全屏' },
  'radius-modal-footer': { value: '0 0 5px 5px', category: 'radius', label: 'footer 圆角', usage: '模态框 footer 圆角大小' },

  // —— Font（对齐 $font-modal_*）——
  'font-modal-header-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'header 字号', usage: '模态框 title 字号' },
  'font-modal-header-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 字重', usage: '模态框 title 字重' },

  // —— Border（对齐 $width-modal_*-border）——
  'width-modal-header-border': { value: '0', category: 'other', label: 'header 底部描边宽度', usage: '模态框 header 底部描边宽度' },
  'width-modal-footer-border': { value: '0', category: 'other', label: 'footer 顶部描边宽度', usage: '模态框 footer 顶部描边宽度' },

  // —— Shadow（对齐 $shadow-modal_content）——
  'shadow-modal-content': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '内容阴影', usage: '模态框内容阴影' },

  // —— z-index（组件消费；对齐 Semi $z-modal / $z-modal-mask = 1000）——
  //    Semi SCSS 里 .semi-modal-wrap { z-index: $z-modal } 直接消费全局 z 变量。
  //    本库同理：CSS 直接 var(--cd-z-modal)；运行时按堆叠计数由 z-stack 内联覆盖
  //    （内联变量名 --cd-modal-content-z / --cd-modal-mask-z，回退到全局基线）。
  'modal-content-z': { value: 'var(--cd-z-modal)', category: 'other', label: '面板层级', usage: '模态框面板层叠 z-index（运行时按堆叠计数覆盖）' },
  'modal-mask-z': { value: 'var(--cd-z-modal-mask)', category: 'other', label: '蒙层层级', usage: '模态框蒙层层叠 z-index（运行时按堆叠计数覆盖）' },
} satisfies TokenGroup;
