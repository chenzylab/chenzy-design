import Avatar_ from './Avatar.svelte';
import AvatarGroup from './AvatarGroup.svelte';

export const Avatar: typeof Avatar_ & {
  Group: typeof AvatarGroup;
} = Object.assign(Avatar_, { Group: AvatarGroup });

export { AvatarGroup };
export { meta as avatarMeta } from './meta.js';
export type { AvatarShape, AvatarSizeEnum, AvatarGroupContext } from './context.js';
