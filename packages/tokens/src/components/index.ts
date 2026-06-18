/** Aggregate of all component-level tokens. Add new component token files here. */
import { buttonTokens } from './button.js';
import { iconTokens } from './icon.js';
import { dividerTokens } from './divider.js';
import { spaceTokens } from './space.js';
import { typographyTokens } from './typography.js';

export const componentTokens = {
  ...buttonTokens,
  ...iconTokens,
  ...dividerTokens,
  ...spaceTokens,
  ...typographyTokens,
} as const;
