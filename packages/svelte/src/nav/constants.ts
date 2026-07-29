/**
 * Nav 常量（对齐 semi-foundation/navigation/constants.ts）。
 *
 * Semi 分 cssClasses / strings / numbers 三组；本库 class 前缀由各 .svelte 内联书写
 * （scoped 样式架构，见 prefixcls-blocked-by-scoped-global-style-arch），故只镜像
 * strings / numbers 两组语义常量，供 Nav.svelte 与子组件消费，避免散写魔数。
 */

/** 导航模式（对齐 Semi strings.MODE_*）。 */
export const MODE_VERTICAL = 'vertical';
export const MODE_HORIZONTAL = 'horizontal';
export const MODES = [MODE_VERTICAL, MODE_HORIZONTAL] as const;

/** 展开箭头位置（对齐 Semi strings.TOGGLE_ICON_*）。 */
export const TOGGLE_ICON_LEFT = 'left';
export const TOGGLE_ICON_RIGHT = 'right';

/** Header logo 默认图标尺寸（对齐 Semi strings.DEFAULT_LOGO_ICON_SIZE）。 */
export const DEFAULT_LOGO_ICON_SIZE = 'extra-large';

/** 数值常量（对齐 Semi numbers.*，单位 ms）。 */
export const DEFAULT_SUBNAV_MAX_HEIGHT = 999;
export const DEFAULT_TOOLTIP_SHOW_DELAY = 0;
export const DEFAULT_TOOLTIP_HIDE_DELAY = 100;
export const DEFAULT_SUBNAV_OPEN_DELAY = 0;
export const DEFAULT_SUBNAV_CLOSE_DELAY = 100;
