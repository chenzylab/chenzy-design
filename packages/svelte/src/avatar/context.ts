import { getContext, setContext, type Snippet } from 'svelte';

export type AvatarShape = 'circle' | 'square';
// 7 档尺寸，1:1 对齐 Semi strings.SIZE。
export type AvatarSizeEnum =
  | 'extra-extra-small'
  | 'extra-small'
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'extra-large';
// 16 档语义色 + white，1:1 对齐 Semi strings.COLOR。
export type AvatarColor =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'grey'
  | 'indigo'
  | 'light-blue'
  | 'light-green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'violet'
  | 'yellow'
  | 'white';
export type AvatarOverlapFrom = 'start' | 'end';

/** 额外边框（对齐 Semi border prop）。 */
export type AvatarBorder = boolean | { color?: string; motion?: boolean };

/** 顶部 Slot 配置（对齐 Semi topSlot）。text 可为字符串或 Snippet。 */
export interface AvatarTopSlot {
  render?: unknown;
  gradientStart?: string;
  gradientEnd?: string;
  text?: unknown;
  textColor?: string;
  className?: string;
  style?: string;
}

/** 底部 Slot 配置（对齐 Semi bottomSlot）。text 可为字符串或 Snippet。 */
export interface AvatarBottomSlot {
  render?: unknown;
  shape?: AvatarShape;
  text?: unknown;
  bgColor?: string;
  textColor?: string;
  className?: string;
  style?: string;
}

export interface AvatarGroupContext {
  // Semi AvatarGroup 用 cloneElement 强制注入 size/shape 到子 Avatar，
  // 因此组级值优先级高于子自身 prop（与「子优先」相反，严格对齐 Semi）。
  getShape: () => AvatarShape | undefined;
  getSize: () => AvatarSizeEnum | number | undefined;
  /**
   * 组合式用法的成员注册（对齐 Semi `React.Children.toArray(children)` 的可计数/可切片语义）。
   * 子 <Avatar> 在 init 期注册自身序号，据此判断：
   *  - 序号 < maxCount → 正常渲染；
   *  - 序号 >= maxCount → 自身不渲染（被折叠进「+N」，由组统一渲染溢出头像）。
   * Svelte 无法遍历 snippet，故改由子组件主动上报——等价能力，见 Nav.Item / Table Column 同款先例。
   */
  register?: (item: AvatarGroupMember) => number;
  /** 组是否启用了折叠（maxCount 有效）。未启用时子组件一律渲染。 */
  isCollapsing?: () => boolean;
  /** 该序号是否应被折叠隐藏。 */
  isHidden?: (index: number) => boolean;
  /** 层叠压盖方向（对齐 Semi item-start-N/item-end-N 类名，子 Avatar 据此选类）。 */
  getOverlapFrom?: () => AvatarOverlapFrom;
}

/**
 * 组合式成员注册描述符（供组渲染「+N」时读取 alt 做无障碍文案，renderMore 时供业务重渲染）。
 * content 是该 Avatar 自己的 children snippet 引用（非提取出的文本）：Svelte snippet
 * 无法被内省取出文字（不像 React children 是可读的 vnode），但同一个 snippet 可以在
 * 不同位置重复 {@render}——故直接把子 Avatar 的 children 原样透传给 renderMore，
 * 让业务在溢出列表里用 `{@render member.content?.()}` 还原出与组内一致的头像内容
 * （对齐 Semi React.cloneElement(avatar,{size}) 保留原 children 的语义）。
 */
export interface AvatarGroupMember {
  alt?: string;
  color?: AvatarColor;
  src?: string;
  srcSet?: string;
  style?: string;
  content?: Snippet;
}

const KEY = Symbol('cd-avatar-group');

export function setAvatarGroupContext(ctx: AvatarGroupContext): void {
  setContext(KEY, ctx);
}

export function getAvatarGroupContext(): AvatarGroupContext | undefined {
  return getContext<AvatarGroupContext | undefined>(KEY);
}
