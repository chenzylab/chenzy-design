/** Aggregate of all component-level tokens. Add new component token files here. */
import { buttonTokens } from './button.js';
import { iconTokens } from './icon.js';
import { dividerTokens } from './divider.js';
import { spaceTokens } from './space.js';
import { typographyTokens } from './typography.js';
import { gridTokens } from './grid.js';
import { layoutTokens } from './layout.js';
import { inputTokens } from './input.js';
import { switchTokens } from './switch.js';
import { checkboxTokens } from './checkbox.js';
import { radioTokens } from './radio.js';
import { ratingTokens } from './rating.js';
import { sliderTokens } from './slider.js';
import { formTokens } from './form.js';
import { selectTokens } from './select.js';

export const componentTokens = {
  ...buttonTokens,
  ...iconTokens,
  ...dividerTokens,
  ...spaceTokens,
  ...typographyTokens,
  ...gridTokens,
  ...layoutTokens,
  ...inputTokens,
  ...switchTokens,
  ...checkboxTokens,
  ...radioTokens,
  ...ratingTokens,
  ...sliderTokens,
  ...formTokens,
  ...selectTokens,
} as const;
