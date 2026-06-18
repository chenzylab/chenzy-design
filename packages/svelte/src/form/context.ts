import { getContext, setContext } from 'svelte';
import type { FormApi, FormState } from '@chenzy-design/core';

export type FormLayout = 'vertical' | 'horizontal';
export type FormLabelPosition = 'top' | 'left';
export type FormSize = 'small' | 'default' | 'large';

export interface FormContext {
  /** the headless form instance from @chenzy-design/core */
  form: FormApi;
  /** getter keeps the bridged $state reactive across context boundary */
  getFormState: () => FormState;
  // getters keep the shared config reactive to Form prop changes across the
  // context boundary (reading a plain value would freeze the initial snapshot).
  getLabelPosition: () => FormLabelPosition;
  getLabelWidth: () => number | string | undefined;
  getSize: () => FormSize;
  getDisabled: () => boolean;
  getRequiredMark: () => boolean;
  getColon: () => boolean;
}

const KEY = Symbol('cd-form');

export function setFormContext(ctx: FormContext): void {
  setContext(KEY, ctx);
}

export function getFormContext(): FormContext | undefined {
  return getContext<FormContext | undefined>(KEY);
}
