/**
 * Component tokens for VideoPlayer — 严格镜像 Semi semi-foundation/videoPlayer/variables.scss + animation.scss（68 个）。
 * 命名保留 Semi 驼峰段：`$color-videoPlayer_theme_dark-text` → `--cd-color-videoPlayer-theme-dark-text`
 * （`_` 段分隔映射为 `-`，videoPlayer 驼峰整名保留）。值 `rgba(var(--semi-x-n),a)` → alpha=1 用
 * `var(--cd-color-x-n)`、alpha<1 用 color-mix；`var(--semi-color-*)` → `var(--cd-color-*)`；硬编码
 * RGB/#fff **照搬 Semi**（controls-bg/text/popup-hover 等，Semi 未走 token 化——用户决策照搬缺陷）。
 * 见 plus 对齐工程 [[plus-components-align-semi-batch]]。
 */
import type { TokenGroup } from './token-def.js';

export const videoPlayerTokens = {
  // —— Color（20，镜像 Semi）——
  'color-videoPlayer-theme-dark-text': { value: 'var(--cd-color-bg-0)', category: 'color', label: 'dark 字体色', usage: 'dark 主题字体色（对齐 Semi color-bg-0）' },
  'color-videoPlayer-theme-dark-bg': { value: 'var(--cd-color-grey-8)', category: 'color', label: 'dark 背景色', usage: 'dark 主题背景色（对齐 Semi grey-8）' },
  'color-videoPlayer-theme-light-text': { value: 'var(--cd-color-grey-8)', category: 'color', label: 'light 字体色', usage: 'light 主题字体色（对齐 Semi grey-8）' },
  'color-videoPlayer-theme-light-bg': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: 'light 背景色', usage: 'light 主题背景色（对齐 Semi color-disabled-bg）' },
  'color-videoPlayer-pause-bg': { value: 'var(--cd-color-text-1)', category: 'color', label: '暂停按钮色', usage: '中央暂停按钮颜色（对齐 Semi color-text-1）' },
  'color-videoPlayer-notification-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: 'notification 背景', usage: 'notification 背景色（对齐 Semi color-overlay-bg）' },
  'color-videoPlayer-notification-text': { value: 'var(--cd-color-grey-0)', category: 'color', label: 'notification 字体', usage: 'notification 字体色（对齐 Semi color-default=grey-0）' },
  'color-videoPlayer-controls-bg': { value: 'rgba(28, 31, 35, 0.8)', category: 'color', label: '控制栏背景', usage: '控制栏背景色（照搬 Semi 硬编码 rgba(28,31,35,.8)）' },
  'color-videoPlayer-controls-item-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '控制栏 item 背景', usage: '控制栏 item 背景色（对齐 Semi color-overlay-bg）' },
  'color-videoPlayer-controls-text': { value: '#fff', category: 'color', label: '控制栏文字', usage: '控制栏文字色（照搬 Semi 硬编码 #fff）' },
  'color-videoPlayer-controls-item-popup-bg-default': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '弹层背景', usage: '控制栏弹层背景色（对齐 Semi color-overlay-bg）' },
  'color-videoPlayer-controls-item-popup-bg-hover': { value: 'rgba(67, 68, 74, 1)', category: 'color', label: '弹层背景 hover', usage: '控制栏弹层背景 hover（照搬 Semi 硬编码 rgba(67,68,74,1)）' },
  'color-videoPlayer-controls-popup-item-text-default': { value: 'rgba(255, 255, 255, 0.7)', category: 'color', label: '弹层文字', usage: '控制栏弹层文字色（照搬 Semi 硬编码 rgba(#fff,.7)）' },
  'color-videoPlayer-controls-popup-item-text-active': { value: 'var(--cd-color-primary)', category: 'color', label: '弹层文字选中', usage: '控制栏弹层文字选中色（对齐 Semi color-primary）' },
  'color-videoPlayer-progress-bar-bg-played': { value: 'var(--cd-color-primary)', category: 'color', label: '已播放色', usage: '进度条已播放背景色（对齐 Semi color-primary）' },
  'color-videoPlayer-progress-bar-bg-loaded': { value: 'var(--cd-color-grey-3)', category: 'color', label: '已缓冲色', usage: '进度条已加载背景色（对齐 Semi grey-3）' },
  'color-videoPlayer-progress-bar-bg-unplayed': { value: 'var(--cd-color-grey-5)', category: 'color', label: '未播放色', usage: '进度条未播放背景色（对齐 Semi grey-5）' },
  'color-videoPlayer-progress-bar-handle-bg': { value: '#fff', category: 'color', label: 'handle 背景', usage: '进度条 handle 背景色（照搬 Semi 硬编码 #fff）' },
  'color-videoPlayer-progress-bar-handle-border': { value: 'var(--cd-color-primary)', category: 'color', label: 'handle 边框', usage: '进度条 handle 边框色（对齐 Semi color-primary）' },
  'color-videoPlayer-progress-bar-handle-shadow': { value: 'var(--cd-color-shadow)', category: 'color', label: 'handle 阴影', usage: '进度条 handle 阴影色（对齐 Semi color-shadow）' },

  // —— Width/Height（11，镜像 Semi）——
  'height-videoPlayer-progress-bar-hotSpot-default': { value: '20px', category: 'height', label: '进度条热区高', usage: '进度条热区默认高（对齐 Semi 20px）' },
  'height-videoPlayer-progress-bar-default': { value: '4px', category: 'height', label: '进度条默认高', usage: '进度条默认高（对齐 Semi 4px）' },
  'height-videoPlayer-progress-bar-hover': { value: '10px', category: 'height', label: '进度条 hover 高', usage: '进度条 hover 高（对齐 Semi 10px）' },
  'height-videoPlayer-progress-bar-handle': { value: '16px', category: 'height', label: 'handle 高', usage: '进度条 handle 高（对齐 Semi 16px）' },
  'height-videoPlayer-controls-menu-default': { value: '56px', category: 'height', label: '控制栏高', usage: '控制栏默认高（对齐 Semi 56px）' },
  'height-videoPlayer-controls-volume-default': { value: '160px', category: 'height', label: '音量弹层高', usage: '音量弹层默认高（对齐 Semi 160px）' },
  'height-videoPlayer-controls-popup-default': { value: '24px', category: 'height', label: '弹层元素高', usage: '弹层类元素默认高（对齐 Semi 24px）' },
  'height-videoPlayer-controls-popup-item-default': { value: '32px', category: 'height', label: '弹层 item 高', usage: '弹层 item 默认高（对齐 Semi 32px）' },
  'width-videoPlayer-controls-volume-default': { value: '40px', category: 'width', label: '音量弹层宽', usage: '音量弹层默认宽（对齐 Semi 40px）' },
  'width-videoPlayer-controls-popup-item-default': { value: '50px', category: 'width', label: '弹层触发宽', usage: '弹层类元素默认宽（对齐 Semi 50px）' },
  'width-videoPlayer-controls-popup-default': { value: '48px', category: 'width', label: '弹层菜单宽', usage: '弹层菜单默认宽（对齐 Semi 48px）' },

  // —— Spacing（19，镜像 Semi；scss 变量引用展开为 var()）——
  'spacing-videoPlayer-progress-bar-chapter-marginRight': { value: '2px', category: 'spacing', label: '分节间距', usage: '进度条分节间距（对齐 Semi 2px）' },
  'spacing-videoPlayer-notification-bottom': { value: '22px', category: 'spacing', label: 'notification 底距', usage: 'notification 距菜单栏（对齐 Semi 22px）' },
  'spacing-videoPlayer-notification-left': { value: '8px', category: 'spacing', label: 'notification 左距', usage: 'notification 距左侧（对齐 Semi 8px）' },
  'spacing-videoPlayer-notification-text-paddingY': { value: '8px', category: 'spacing', label: 'notification padY', usage: 'notification 文字纵向 padding（对齐 Semi 8px）' },
  'spacing-videoPlayer-notification-text-paddingX': { value: '12px', category: 'spacing', label: 'notification padX', usage: 'notification 文字横向 padding（对齐 Semi 12px）' },
  'spacing-videoPlayer-controls-paddingY': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '控制栏 padY', usage: '控制栏纵向 padding（对齐 Semi $spacing-base-tight）' },
  'spacing-videoPlayer-controls-paddingX': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '控制栏 padX', usage: '控制栏横向 padding（对齐 Semi $spacing-base）' },
  'spacing-videoPlayer-controls-item-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '控制栏 item 间距', usage: '控制栏 item 间距（对齐 Semi $spacing-tight）' },
  'spacing-videoPlayer-controls-time-paddingX': { value: '8px', category: 'spacing', label: '时间 padX', usage: '控制栏时间横向 padding（对齐 Semi 8px）' },
  'spacing-videoPlayer-controls-volume-title-paddingX': { value: '10px', category: 'spacing', label: '音量标题 padX', usage: '音量标题横向 padding（对齐 Semi 10px）' },
  'spacing-videoPlayer-controls-volume-title-paddingY': { value: '0px', category: 'spacing', label: '音量标题 padY', usage: '音量标题纵向 padding（对齐 Semi 0px）' },
  'spacing-videoPlayer-controls-volume-popup-paddingY': { value: '0px', category: 'spacing', label: '音量弹层 padY', usage: '音量弹层纵向 padding（对齐 Semi 0px）' },
  'spacing-videoPlayer-controls-volume-popup-paddingX': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '音量弹层 padX', usage: '音量弹层横向 padding（对齐 Semi $spacing-extra-tight）' },
  'spacing-videoPlayer-controls-popup-paddingX': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '弹层 padX', usage: '弹层元素横向 padding（对齐 Semi $spacing-tight）' },
  'spacing-videoPlayer-controls-popup-paddingY': { value: '0px', category: 'spacing', label: '弹层 padY', usage: '弹层元素纵向 padding（对齐 Semi 0px）' },
  'spacing-videoPlayer-progress-bar-wrapper-marginX': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '进度条 marginX', usage: '进度条 wrapper 横向 margin（对齐 Semi $spacing-tight）' },
  'spacing-videoPlayer-progress-bar-wrapper-marginY': { value: '0px', category: 'spacing', label: '进度条 marginY', usage: '进度条 wrapper 纵向 margin（对齐 Semi 0px）' },
  'spacing-videoPlayer-progress-bar-tooltip-top': { value: '6px', category: 'spacing', label: 'Tooltip top', usage: '进度条 Tooltip top（对齐 Semi 6px）' },
  'spacing-videoPlayer-progress-bar-handle-top': { value: '15px', category: 'spacing', label: 'handle top', usage: '进度条 handle top（对齐 Semi 15px）' },
  'spacing-videoPlayer-error-svg-marginBottom': { value: '12px', category: 'spacing', label: 'error svg 下距', usage: 'error svg marginBottom（对齐 Semi 12px）' },

  // —— Radius（5，镜像 Semi）——
  'radius-videoPlayer-notification': { value: '3px', category: 'radius', label: 'notification 圆角', usage: 'notification 圆角（对齐 Semi 3px）' },
  'radius-videoPlayer-progress-bar-handle': { value: '50%', category: 'radius', label: 'handle 圆角', usage: '进度条 handle 圆角（对齐 Semi 50%）' },
  'radius-videoPlayer-progress-bar': { value: '999px', category: 'radius', label: '进度条圆角', usage: '进度条圆角（对齐 Semi 999px）' },
  'radius-videoPlayer-controls-item': { value: '3px', category: 'radius', label: '控制栏 item 圆角', usage: '控制栏 item 圆角（对齐 Semi 3px）' },
  'radius-videoPlayer-controls-popup': { value: '4px', category: 'radius', label: '弹层圆角', usage: '控制栏弹层圆角（对齐 Semi 4px）' },

  // —— Font（8，镜像 Semi）——
  'font-videoPlayer-notification-fontSize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'notification 字号', usage: 'notification 字号（对齐 Semi $font-size-regular）' },
  'font-videoPlayer-controls-item-fontSize': { value: 'var(--cd-font-size-small)', category: 'font', label: '控制栏 item 字号', usage: '控制栏 item 字号（对齐 Semi $font-size-small）' },
  'font-videoPlayer-controls-time-text-fontSize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '时间字号', usage: '控制栏时间字号（对齐 Semi $font-size-regular）' },
  'font-videoPlayer-error-fontSize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'error 字号', usage: 'error 字号（对齐 Semi $font-size-regular）' },
  'font-videoPlayer-notification-lineHeight': { value: '20px', category: 'font', label: 'notification 行高', usage: 'notification 行高（对齐 Semi 20px）' },
  'font-videoPlayer-controls-popup-item-lineHeight': { value: '16px', category: 'font', label: '弹层 item 行高', usage: '控制栏弹层 item 行高（对齐 Semi 16px）' },
  'font-videoPlayer-controls-popup-item-fontWeight': { value: '600', category: 'font', label: '弹层 item 字重', usage: '控制栏弹层 item 字重（对齐 Semi 600）' },
  'font-videoPlayer-error-fontWeight': { value: '600', category: 'font', label: 'error 字重', usage: 'error 字重（对齐 Semi 600）' },

  // —— Animation（5，镜像 Semi animation.scss）——
  'animation-duration-videoPlayer-controls-show': { value: '500ms', category: 'animation', label: '控制栏动画时长', usage: '控制栏淡入淡出时长（对齐 Semi 500ms）' },
  'animation-duration-videoPlayer-slider-in': { value: '300ms', category: 'animation', label: '进度条展开时长', usage: '进度条 hover 展开时长（对齐 Semi 300ms）' },
  'animation-duration-videoPlayer-slider-out': { value: '300ms', category: 'animation', label: '进度条收起时长', usage: '进度条收起时长（对齐 Semi 300ms）' },
  'animation-function-videoPlayer-slider-in': { value: 'cubic-bezier(0.62, 0.05, 0.36, 0.95)', category: 'animation', label: '进度条展开缓动', usage: '进度条展开缓动（对齐 Semi）' },
  'animation-function-videoPlayer-slider-out': { value: 'cubic-bezier(0.62, 0.05, 0.36, 0.95)', category: 'animation', label: '进度条收起缓动', usage: '进度条收起缓动（对齐 Semi）' },
} satisfies TokenGroup;
