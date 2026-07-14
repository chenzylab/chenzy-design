/**
 * Component tokens for UserGuide（Show，严格对齐 Semi userGuide/variables.scss）。
 * 名与值逐条镜像 Semi $…-userGuide_… 变量（见 ~/i/semi-design/packages/semi-foundation/
 * userGuide/variables.scss + animation.scss）。组件消费的 token 名与 alias/global 层不同名，
 * var() 无自引用死循环。破坏性重写：移除 Semi 无的中间变量，无向后兼容。
 */
import type { TokenGroup } from './token-def.js';

export const userGuideTokens = {
  // —— Color（对齐 Semi variables.scss Color 段）——
  'userguide-popup-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '气泡文字色 - 默认', usage: 'popup default 主题文字（.cd-userGuide-popup-content）' },
  'userguide-popup-text-primary': { value: 'var(--cd-color-tertiary-light-default)', category: 'color', label: '气泡文字色 - primary', usage: 'popup primary 主题文字（.cd-userGuide-popup-content-primary）' },
  'userguide-modal-indicator-bg': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '弹窗指示器背景色', usage: 'modal 指示器未激活态（.cd-userGuide-modal-indicator-item）' },
  'userguide-modal-indicator-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '弹窗指示器背景色 - 选中', usage: 'modal 指示器激活态（.cd-userGuide-modal-indicator-item-active）' },

  // —— Width / Height（对齐 Semi variables.scss Width/Height 段）——
  'userguide-popover-width': { value: '400px', category: 'other', label: '气泡卡片宽度', usage: '默认气泡卡片宽度（.cd-userGuide-popover）' },
  'userguide-popup-cover-height': { value: '200px', category: 'other', label: '气泡封面高度', usage: '默认气泡卡片封面高度（.cd-userGuide-popup-content-cover img）' },
  'userguide-modal-cover-width': { value: '600px', category: 'other', label: '弹窗封面宽度', usage: '默认弹窗式卡片封面宽度（.cd-userGuide-modal-content）' },
  'userguide-modal-cover-height': { value: '300px', category: 'other', label: '弹窗封面高度', usage: '默认弹窗式卡片封面高度（.cd-userGuide-modal-cover）' },
  'userguide-modal-indicator-height': { value: '30px', category: 'other', label: '弹窗指示器整体高度', usage: '默认弹窗式卡片指示器整体高度（.cd-userGuide-modal-indicator）' },
  'userguide-modal-indicator-item-width': { value: '6px', category: 'other', label: '单个指示器宽度', usage: '默认弹窗式卡片单个指示器宽度（.cd-userGuide-modal-indicator-item）' },
  'userguide-modal-indicator-item-height': { value: '6px', category: 'other', label: '单个指示器高度', usage: '默认弹窗式卡片单个指示器高度（.cd-userGuide-modal-indicator-item）' },

  // —— Line height（对齐 Semi variables.scss lineHeight 段）——
  'userguide-popup-title-line-height': { value: '24px', category: 'font', label: '气泡标题行高', usage: 'popup 标题行高（.cd-userGuide-popup-content-title）' },
  'userguide-popup-description-line-height': { value: '20px', category: 'font', label: '气泡详情行高', usage: 'popup 详情行高（.cd-userGuide-popup-content-description）' },
  'userguide-popup-indicator-line-height': { value: '20px', category: 'font', label: '气泡指示器行高', usage: 'popup 指示器行高（.cd-userGuide-popup-content-indicator）' },
  'userguide-modal-title-line-height': { value: '24px', category: 'font', label: '弹窗标题行高', usage: 'modal 标题行高（.cd-userGuide-modal-body-title）' },
  'userguide-modal-description-line-height': { value: '20px', category: 'font', label: '弹窗详情行高', usage: 'modal 详情行高（.cd-userGuide-modal-body-description）' },

  // —— Spacing（对齐 Semi variables.scss Spacing 段）——
  'userguide-popup-body-padding': { value: '24px', category: 'spacing', label: '气泡内边距', usage: 'popup 内容内边距（.cd-userGuide-popup-content-body）' },
  'userguide-popup-title-margin-bottom': { value: '8px', category: 'spacing', label: '气泡标题下边距', usage: 'popup 标题底部外边距（.cd-userGuide-popup-content-title）' },
  'userguide-popup-description-margin-bottom': { value: '48px', category: 'spacing', label: '气泡详情下边距', usage: 'popup 详情底部外边距（.cd-userGuide-popup-content-description）' },
  'userguide-popup-button-gap': { value: '12px', category: 'spacing', label: '气泡按钮间距', usage: 'popup 底部按钮间距（.cd-userGuide-popup-content-buttons）' },
  'userguide-popup-button-margin-left': { value: '120px', category: 'spacing', label: '气泡按钮组左边距', usage: 'popup 按钮组左边距（.cd-userGuide-popup-content-buttons）' },
  'userguide-popup-indicator-gap': { value: '8px', category: 'spacing', label: '指示器间距', usage: 'modal 指示器点间距（.cd-userGuide-modal-indicator）' },
  'userguide-modal-title-margin-bottom': { value: '8px', category: 'spacing', label: '弹窗标题下边距', usage: 'modal 标题底部外边距（.cd-userGuide-modal-body-title）' },
  'userguide-modal-body-padding': { value: '24px 48px', category: 'spacing', label: '弹窗 body 内边距', usage: 'modal body 内边距（.cd-userGuide-modal-body）' },
  'userguide-modal-footer-padding': { value: '24px', category: 'spacing', label: '弹窗 footer 内边距', usage: 'modal footer 内边距（.cd-userGuide-modal-footer）' },
  'userguide-modal-button-gap': { value: '12px', category: 'spacing', label: '弹窗按钮间距', usage: 'modal 底部按钮间距（.cd-userGuide-modal-footer）' },

  // —— Radius（对齐 Semi variables.scss Radius 段）——
  'userguide-popup-cover-radius': { value: 'var(--cd-border-radius-medium) var(--cd-border-radius-medium) 0 0', category: 'radius', label: '气泡封面圆角', usage: 'popup 封面上圆角（.cd-userGuide-popup-content-cover img）' },
  'userguide-modal-indicator-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '指示器圆角', usage: 'modal 指示器点圆角（.cd-userGuide-modal-indicator-item）' },

  // —— Font（对齐 Semi variables.scss font 段）——
  'userguide-popup-title-font-size': { value: 'var(--cd-font-size-header-5)', category: 'font', label: '气泡标题字号', usage: 'popup 标题字体大小（.cd-userGuide-popup-content-title）' },
  'userguide-popup-description-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '气泡详情字号', usage: 'popup 详情字体大小（.cd-userGuide-popup-content-description）' },
  'userguide-popup-indicator-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '气泡指示器字号', usage: 'popup 指示器字体大小（.cd-userGuide-popup-content-indicator）' },
  'userguide-popup-title-font-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '气泡标题字重', usage: 'popup 标题字重（.cd-userGuide-popup-content-title）' },
  'userguide-modal-title-font-size': { value: 'var(--cd-font-size-header-5)', category: 'font', label: '弹窗标题字号', usage: 'modal 标题字体大小（.cd-userGuide-modal-body-title）' },
  'userguide-modal-description-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '弹窗详情字号', usage: 'modal 详情字体大小（.cd-userGuide-modal-body-description）' },
  'userguide-modal-title-font-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '弹窗标题字重', usage: 'modal 标题字重（.cd-userGuide-modal-body-title）' },

  // —— Spotlight 遮罩 / 动画（对齐 Semi userGuide.scss overlay-bg + animation.scss）——
  'userguide-spotlight-mask-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: 'spotlight 遮罩背景', usage: 'popup spotlight 遮罩背景（.cd-userGuide-spotlight rect fill）' },
  'userguide-spotlight-duration': { value: '200ms', category: 'other', label: 'spotlight 动画时长', usage: 'spotlight 高亮矩形移动时长（.cd-userGuide-spotlight-rect）' },
  'userguide-spotlight-function': { value: 'cubic-bezier(0.4, 0, 0.2, 1)', category: 'other', label: 'spotlight 过渡曲线', usage: 'spotlight 高亮矩形过渡曲线（.cd-userGuide-spotlight-rect）' },
} satisfies TokenGroup;
