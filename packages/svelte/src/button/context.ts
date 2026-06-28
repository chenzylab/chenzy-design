/**
 * ButtonGroup → Button 上下文。
 * ButtonGroup 通过 setContext 提供组级默认值（size/type/theme/disabled）；
 * Button 通过 getContext 读取，仅在「未显式设置该 prop」时作为默认回退，
 * 不破坏 Button 现有 API（显式 prop 始终优先）。
 */
import { getContext, hasContext } from 'svelte';

export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
export type ButtonTheme = 'solid' | 'borderless' | 'light' | 'outline';
export type ButtonSize = 'small' | 'default' | 'large';

export interface ButtonGroupContext {
  type?: ButtonType | undefined;
  theme?: ButtonTheme | undefined;
  size?: ButtonSize | undefined;
  disabled?: boolean | undefined;
}

export const BUTTON_GROUP_CTX = Symbol('cd-button-group');

/** Button 内部读取 ButtonGroup 上下文（无则 undefined）。 */
export function getButtonGroupContext(): ButtonGroupContext | undefined {
  return hasContext(BUTTON_GROUP_CTX)
    ? (getContext(BUTTON_GROUP_CTX) as ButtonGroupContext)
    : undefined;
}
