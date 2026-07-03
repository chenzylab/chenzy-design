/**
 * Component tokens for Modal（M5 Feedback）。全量对齐 Semi Design
 * （semi-foundation/modal/variables.scss 63 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Modal / ConfirmModal 实际消费的补充 token（原名，Semi 无 /
 * 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)；var(--semi-color-overlay-bg)
 *    → var(--cd-color-overlay-bg)。
 *  - Semi $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；
 *    $font-size-regular → var(--cd-font-size-regular)；$font-weight-bold →
 *    var(--cd-font-weight-bold)。
 *  - var(--semi-border-radius-large) → var(--cd-border-radius-large)；
 *    var(--semi-shadow-elevated) → var(--cd-shadow-elevated)。
 *  - 组件 token 名（color-modal-* / spacing-modal-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const modalTokens = {
  // —— Color ——
  'color-modal-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '模态框背景色', usage: '模态框背景颜色' },
  'color-modal-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '蒙层颜色', usage: '模态框蒙层颜色' },
  'color-modal-main-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字颜色', usage: '模态框文字颜色' },
  'color-modal-info-icon': { value: 'var(--cd-color-info)', category: 'color', label: '信息图标颜色', usage: '模态框信息图标颜色' },
  'color-modal-primary-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '主要图标颜色', usage: '模态框主要图标颜色' },
  'color-modal-success-icon': { value: 'var(--cd-color-success)', category: 'color', label: '成功图标颜色', usage: '模态框成功图标颜色' },
  'color-modal-danger-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '危险图标颜色', usage: '模态框危险图标颜色' },
  'color-modal-warning-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标颜色', usage: '模态框警告图标颜色' },
  'color-modal-content-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边颜色', usage: '模态框描边颜色' },
  'color-modal-header-bg': { value: 'transparent', category: 'color', label: 'header 背景色', usage: '模态框 header 背景填充色' },
  'color-modal-footer-bg': { value: 'transparent', category: 'color', label: 'footer 背景色', usage: '模态框 footer 背景填充色' },

  // —— Spacing ——
  'spacing-modal-marginy': { value: '80px', category: 'spacing', label: '距顶外边距', usage: '模态框距容器顶部外边距' },
  'spacing-modal-marginx': { value: 'auto', category: 'spacing', label: '水平外边距', usage: '模态框水平外边距（默认居中）' },
  'spacing-modal-mask-top': { value: '0', category: 'spacing', label: '蒙层顶部', usage: '模态框蒙层顶部位置' },
  'spacing-modal-mask-right': { value: '0', category: 'spacing', label: '蒙层右侧', usage: '模态框蒙层右侧位置' },
  'spacing-modal-mask-bottom': { value: '0', category: 'spacing', label: '蒙层底部', usage: '模态框蒙层底部位置' },
  'spacing-modal-mask-left': { value: '0', category: 'spacing', label: '蒙层左侧', usage: '模态框蒙层左侧位置' },
  'spacing-modal-content-withicon-marginleft': { value: '36px', category: 'spacing', label: '带图标内容左外边距', usage: '带图标模态框内容左侧外边距' },
  'spacing-modal-icon-wrapper-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标右外边距', usage: '模态框图标右侧外边距' },
  'spacing-modal-wrap-top': { value: '0', category: 'spacing', label: '容器顶部', usage: '模态框容器顶部位置' },
  'spacing-modal-wrap-right': { value: '0', category: 'spacing', label: '容器右侧', usage: '模态框容器右侧位置' },
  'spacing-modal-wrap-bottom': { value: '0', category: 'spacing', label: '容器底部', usage: '模态框容器底部位置' },
  'spacing-modal-wrap-left': { value: '0', category: 'spacing', label: '容器左侧', usage: '模态框容器左侧位置' },
  'spacing-modal-title-margin': { value: '0', category: 'spacing', label: '标题外边距', usage: '模态框标题外边距' },
  'spacing-modal-content-paddingy': { value: '0', category: 'spacing', label: '内容垂直内边距', usage: '模态框内容垂直内边距' },
  'spacing-modal-content-paddingx': { value: '24px', category: 'spacing', label: '内容水平内边距', usage: '模态框内容水平内边距' },
  'spacing-modal-header-marginy': { value: '24px', category: 'spacing', label: '标题垂直外边距', usage: '模态框标题垂直外边距' },
  'spacing-modal-header-marginx': { value: '0', category: 'spacing', label: '标题水平外边距', usage: '模态框标题水平外边距' },
  'spacing-modal-header-paddingy': { value: '0', category: 'spacing', label: '标题垂直内边距', usage: '模态框标题垂直内边距' },
  'spacing-modal-header-paddingx': { value: '0', category: 'spacing', label: '标题水平内边距', usage: '模态框标题水平内边距' },
  'spacing-modal-body-wrapper-marginy': { value: '24px', category: 'spacing', label: 'body 容器垂直外边距', usage: '模态框 body 容器垂直外边距' },
  'spacing-modal-body-wrapper-marginx': { value: '0', category: 'spacing', label: 'body 容器水平外边距', usage: '模态框 body 容器水平外边距' },
  'spacing-modal-body-margin': { value: '0', category: 'spacing', label: 'body 外边距', usage: '模态框 body 外边距' },
  'spacing-modal-body-padding': { value: '0', category: 'spacing', label: 'body 内边距', usage: '模态框 内容外Padding' },
  'spacing-modal-footer-marginy': { value: '24px', category: 'spacing', label: 'footer 垂直外边距', usage: '模态框 footer 垂直外边距' },
  'spacing-modal-footer-marginx': { value: '0', category: 'spacing', label: 'footer 水平外边距', usage: '模态框 footer 水平外边距' },
  'spacing-modal-footer-paddingy': { value: '0', category: 'spacing', label: 'footer 垂直内边距', usage: '模态框 footer 垂直内边距' },
  'spacing-modal-footer-paddingx': { value: '0', category: 'spacing', label: 'footer 水平内边距', usage: '模态框 footer 水平内边距' },
  'spacing-modal-footer-button-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'footer 按钮左外边距', usage: '模态框 footer 按钮左侧外边距' },
  'spacing-modal-footer-button-marginright': { value: '0', category: 'spacing', label: 'footer 按钮右外边距', usage: '模态框 footer 按钮右侧外边距' },
  'spacing-modal-confirm-header-marginbottom': { value: '8px', category: 'spacing', label: '命令式 header 底外边距', usage: '命令式调用模态框 header 底部外边距' },
  'spacing-modal-confirm-icon-wrapper-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '命令式图标右外边距', usage: '命令式调用模态框图标右侧外边距' },
  'spacing-modal-content-fullscreen-top': { value: '0px', category: 'spacing', label: '全屏内容顶部', usage: '模态框内容全屏顶部位置' },

  // —— Width / Height ——
  'width-modal-title': { value: '100%', category: 'width', label: '标题宽度', usage: '模态框标题宽度' },
  'width-modal-content': { value: '100%', category: 'width', label: '内容宽度', usage: '模态框内容宽度' },
  'height-modal-content': { value: 'max-content', category: 'height', label: '内容高度', usage: '模态框内容高度' },
  'width-modal-content-border': { value: '1px', category: 'width', label: '内容描边宽度', usage: '模态框内容描边宽度' },
  'width-modal-small': { value: '448px', category: 'width', label: '宽度 - 小', usage: '模态框宽度 - 小' },
  'width-modal-medium': { value: '684px', category: 'width', label: '宽度 - 中', usage: '模态框宽度 - 中' },
  'width-modal-large': { value: '920px', category: 'width', label: '宽度 - 大', usage: '模态框宽度 - 大' },
  'width-modal-full-width': { value: 'calc(100vw - 64px)', category: 'width', label: '宽度 - 全屏', usage: '模态框宽度 - 全屏' },

  // —— Radius ——
  'radius-modal-content': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '圆角大小', usage: '模态框圆角大小' },
  'radius-modal-content-fullscreen': { value: '0', category: 'radius', label: '圆角 - 全屏', usage: '模态框圆角大小 - 全屏' },
  'radius-modal-footer': { value: '0 0 5px 5px', category: 'radius', label: 'footer 圆角', usage: '模态框 footer 圆角大小' },

  // —— Font ——
  'font-modal-header-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'title 字号', usage: '模态框 title 字号' },
  'font-modal-header-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'title 字重', usage: '模态框 title 字重' },

  // —— Border ——
  'color-modal-header-border': { value: 'transparent', category: 'color', label: 'header 底部描边色', usage: '模态框 header 底部描边颜色' },
  'width-modal-header-border': { value: '0', category: 'width', label: 'header 底部描边宽度', usage: '模态框 header 底部描边宽度' },
  'color-modal-footer-border': { value: 'transparent', category: 'color', label: 'footer 顶部描边色', usage: '模态框 footer 顶部描边颜色' },
  'width-modal-footer-border': { value: '0', category: 'width', label: 'footer 顶部描边宽度', usage: '模态框 footer 顶部描边宽度' },

  // —— Shadow / Filter ——
  'shadow-modal-content': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '内容阴影', usage: '模态框内容阴影' },
  'filter-modal-mask-bg': { value: 'none', category: 'other', label: '蒙层滤镜', usage: '模态框蒙层背景滤镜' },
  'filter-modal-content-bg': { value: 'none', category: 'other', label: '内容滤镜', usage: '模态框内容背景滤镜' },

  // —— chenzy-design Modal / ConfirmModal 实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费） ——
  'modal-radius': { value: 'var(--cd-radius-modal-content)', category: 'radius', label: '面板圆角', usage: '面板圆角（组件消费；引 radius-modal-content）' },
  'modal-bg': { value: 'var(--cd-color-modal-bg)', category: 'color', label: '面板背景色', usage: '面板背景（组件消费；引 color-modal-bg）' },
  'modal-shadow': { value: 'var(--cd-shadow-modal-content)', category: 'other', label: '面板阴影', usage: '面板阴影（组件消费；引 shadow-modal-content）' },
  'modal-mask-bg': { value: 'var(--cd-color-modal-mask-bg)', category: 'color', label: '蒙层背景色', usage: '蒙层背景（组件消费；引 color-modal-mask-bg）' },
  'modal-padding': { value: 'var(--cd-spacing-modal-content-paddingx)', category: 'spacing', label: '面板内边距', usage: '面板内边距（组件消费；对齐 Semi 内容水平内边距 24px）' },
  'modal-header-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'header 间距', usage: 'header 元素与底部间距（组件消费）' },
  'modal-footer-gap': { value: 'var(--cd-spacing-modal-footer-button-marginleft)', category: 'spacing', label: 'footer 按钮间距', usage: 'footer 按钮间距（组件消费；对齐 Semi 按钮左外边距 12px）' },
  'modal-title-color': { value: 'var(--cd-color-modal-main-text)', category: 'color', label: '标题颜色', usage: '标题文字颜色（组件消费；引 color-modal-main-text）' },
  'modal-title-size': { value: 'var(--cd-font-modal-header-fontsize)', category: 'font', label: '标题字号', usage: '标题字号（组件消费；引 font-modal-header-fontsize）' },
  'modal-title-weight': { value: 'var(--cd-font-modal-header-fontweight)', category: 'font', label: '标题字重', usage: '标题字重（组件消费；引 font-modal-header-fontweight）' },
  'modal-body-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '正文颜色', usage: '正文文字颜色（组件消费）' },
  'modal-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '关闭按钮图标颜色（组件消费）' },
  'modal-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },
  'modal-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '面板层叠 z-index 基线（组件消费；运行时按堆叠计数覆盖）' },
  'modal-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '过渡时长', usage: '开合过渡时长（组件消费）' },
} satisfies TokenGroup;
