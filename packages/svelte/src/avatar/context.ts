import { getContext, setContext } from 'svelte';

export type AvatarShape = 'circle' | 'square';
export type AvatarSizeEnum = 'extra-small' | 'small' | 'default' | 'large' | 'extra-large';

export interface AvatarGroupContext {
  // getters keep the shared config reactive to Group prop changes across the
  // context boundary (reading a plain value would freeze the initial snapshot).
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
