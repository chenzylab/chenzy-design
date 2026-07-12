import { getContext, setContext } from 'svelte';

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
}

const KEY = Symbol('cd-avatar-group');

export function setAvatarGroupContext(ctx: AvatarGroupContext): void {
  setContext(KEY, ctx);
}

export function getAvatarGroupContext(): AvatarGroupContext | undefined {
  return getContext<AvatarGroupContext | undefined>(KEY);
}
