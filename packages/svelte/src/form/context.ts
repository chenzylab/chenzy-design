import { getContext, setContext } from 'svelte';
import type { FormApi, FormState } from '@chenzy-design/core';

export type FormLayout = 'vertical' | 'horizontal';
export type FormLabelPosition = 'top' | 'left' | 'inset';
export type FormLabelAlign = 'left' | 'right';

export interface GridCol {
  span?: number;
  offset?: number;
}

export interface FormContext {
  /** the headless form instance from @chenzy-design/core */
  form: FormApi;
  /** getter keeps the bridged $state reactive across context boundary */
  getFormState: () => FormState;
  // getters keep the shared config reactive to Form prop changes across the
  // context boundary (reading a plain value would freeze the initial snapshot).
  getLabelPosition: () => FormLabelPosition;
  getLabelWidth: () => number | string | undefined;
  /** Label text alignment (spec §4 L60). */
  getLabelAlign: () => FormLabelAlign;
  getDisabled: () => boolean;
  getRequiredMark: () => boolean;
  /** whether error/warning text carries a status icon (spec §4 L66). */
  getShowValidateIcon: () => boolean;
  /** extra text position: 'middle' | 'bottom' (default 'bottom'). */
  getExtraTextPosition: () => 'middle' | 'bottom';
  /** 控件布局列配置（Grid 布局时）。 */
  getWrapperCol: () => GridCol | undefined;
  /** 标签布局列配置（Grid 布局时）。 */
  getLabelCol: () => GridCol | undefined;
}

const KEY = Symbol('cd-form');

export function setFormContext(ctx: FormContext): void {
  setContext(KEY, ctx);
}

export function getFormContext(): FormContext | undefined {
  return getContext<FormContext | undefined>(KEY);
}

/** Context set by <Form.ArrayField> around its rows (aligns with Semi ArrayFieldContext). */
export interface ArrayFieldContext {
  /** true when the current Field is nested inside a <Form.ArrayField> row. */
  inArrayField: boolean;
}

const ARRAY_FIELD_KEY = Symbol('cd-array-field');

export function setArrayFieldContext(ctx: ArrayFieldContext): void {
  setContext(ARRAY_FIELD_KEY, ctx);
}

/** 后代组件读取是否处于 Form.ArrayField 内（对齐 Semi useArrayFieldState）。不在 ArrayField 内返回 undefined。 */
export function getArrayFieldContext(): ArrayFieldContext | undefined {
  return getContext<ArrayFieldContext | undefined>(ARRAY_FIELD_KEY);
}
