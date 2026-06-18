/**
 * Public token API: typed key union + var() resolver.
 * The actual values live in tokens.css (generated). Consumers reference vars.
 */
import { aliasLight } from './alias/index.js';
import { buttonTokens } from './components/button.js';

export const prefix = '--cd-' as const;

export type AliasTokenKey = keyof typeof aliasLight;
export type ComponentTokenKey = keyof typeof buttonTokens;
export type TokenKey = AliasTokenKey | ComponentTokenKey;

/** resolve a semantic/component token name to its CSS var() reference */
export function tk(name: TokenKey): string {
  return `var(${prefix}${name})`;
}

export { palette } from './global/color.js';
export { aliasLight, aliasDark } from './alias/index.js';
