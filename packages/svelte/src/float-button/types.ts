import type { Snippet } from 'svelte';

/** Badge 参数子集（复用本库 Badge props）；有值时外层包裹 Badge。 */
export interface FloatButtonBadgeProps {
  count?: number | string;
  dot?: boolean;
  overflowCount?: number;
  type?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  theme?: 'solid' | 'light' | 'inverted';
}

/** 形状：`'round'`（正圆，默认）/ `'square'`（方形）。对齐 Semi。 */
export type FloatButtonShape = 'round' | 'square';
export type FloatButtonSize = 'small' | 'default' | 'large';

export interface FloatButtonProps {
  /**
   * 图标内容，渲染在按钮主体内。为 Snippet（对齐本库 Button 的 icon 约定）。
   * 需渲染一个图标组件时，用一个内联 snippet 包裹它：`{#snippet icon()}<MyIcon />{/snippet}`。
   */
  icon?: Snippet;
  /** 徽章参数（复用本库 Badge）；有值时外层包裹 Badge。 */
  badge?: FloatButtonBadgeProps;
  /** 形状：round=正圆（默认）、square=方形。 */
  shape?: FloatButtonShape;
  /** 尺寸三档。 */
  size?: FloatButtonSize;
  /** AI 风格多彩渐变外观。 */
  colorful?: boolean;
  /** 禁用（不触发跳转/onClick）。 */
  disabled?: boolean;
  /** 有值时点击经 JS 跳转（对齐 Semi：_blank 用 window.open，否则 location.href）。 */
  href?: string;
  /** 链接打开目标；`'_blank'` 时用 window.open 新开。 */
  target?: string;
  /** 点击回调；disabled 时不触发。 */
  onClick?: (e: MouseEvent) => void;
  /** 根节点自定义类名。 */
  class?: string;
  /** 根节点自定义内联样式（定位方式：设 bottom/right 等覆盖默认 fixed 位置）。 */
  style?: string;
}

/** Group 子项 = FloatButton 全部 props + value + content。 */
export interface FloatButtonGroupItem extends FloatButtonProps {
  /** 渲染为 data-value，供组级点击委托回传。 */
  value: string;
  /** 在 icon 之后渲染的内容（文字或 Snippet）。 */
  content?: Snippet | string;
}

export interface FloatButtonGroupProps {
  /** 子项数组，遍历渲染。 */
  items?: FloatButtonGroupItem[];
  /** 组级禁用样式。 */
  disabled?: boolean;
  /** 组级点击委托，回传被点项 value（对齐 Semi：直接读 e.target.dataset.value）。 */
  onClick?: (value: string, e: MouseEvent) => void;
  /** 根节点自定义类名。 */
  class?: string;
  /** 定位方式，同 FloatButton。 */
  style?: string;
}
