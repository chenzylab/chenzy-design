import type { Snippet } from 'svelte';

/** Badge 参数子集（复用本库 Badge props）；有值时外层包裹 Badge。 */
export interface FloatButtonBadgeProps {
  count?: number | string;
  dot?: boolean;
  overflowCount?: number;
  showZero?: boolean;
  type?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
}

/**
 * 形状：`'round'`（正圆，默认，对齐 Semi）/ `'square'`（小圆角方形），
 * 或任意 CSS border-radius 字符串（如 `'8px'` / `'30%'` / `'50%'`）自定义圆角
 * （本库相较 Semi 额外提供的灵活性）。
 */
export type FloatButtonShape = 'round' | 'square' | (string & {});
export type FloatButtonSize = 'small' | 'default' | 'large';

export interface FloatButtonProps {
  /**
   * 图标内容，渲染在按钮主体内。为 Snippet（对齐本库 Button 的 icon 约定）。
   * 需渲染一个图标组件时，用一个内联 snippet 包裹它：`{#snippet icon()}<MyIcon />{/snippet}`。
   */
  icon?: Snippet;
  /** 徽章参数（复用本库 Badge）；有值时外层包裹 Badge。 */
  badge?: FloatButtonBadgeProps;
  /** 形状：round=正圆（默认），square=方形，或任意 CSS border-radius 字符串自定义。 */
  shape?: FloatButtonShape;
  /** 尺寸三档。 */
  size?: FloatButtonSize;
  /** AI 风格多彩渐变外观。 */
  colorful?: boolean;
  /** 禁用（不触发跳转/onClick）。 */
  disabled?: boolean;
  /** 有值时渲染为 <a>（语义化链接）。 */
  href?: string;
  /** 链接打开目标；_blank 时自动补 rel="noopener noreferrer"。 */
  target?: string;
  /** 无可视文字时的可访问名（图标按钮必填，dev 缺失时 warn）。 */
  ariaLabel?: string;
  /** 点击回调；disabled 时不触发。 */
  onClick?: (e: MouseEvent) => void;
  /** 根节点自定义类名。 */
  class?: string;
  /** 根节点自定义内联样式。主要定位方式：设 inset-inline-end / inset-block-end 等。 */
  style?: string;
  /** 按钮文字/内容（有则非 icon-only）。 */
  children?: Snippet;
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
  /** 组的可访问名（role="group"）；缺省取 i18n 默认。 */
  ariaLabel?: string;
  /** 组级点击委托，回传被点项 value。 */
  onClick?: (value: string, e: MouseEvent) => void;
  /** 根节点自定义类名。 */
  class?: string;
  /** 定位方式，同 FloatButton。 */
  style?: string;
}
