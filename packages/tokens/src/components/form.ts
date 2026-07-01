/** Component tokens for Form. See specs/components/input/Form.spec.md. */
export const formTokens = {
  'form-item-gap': 'var(--cd-spacing-base)',
  'form-label-color': 'var(--cd-color-text-0)',
  'form-label-gap': 'var(--cd-spacing-tight)',
  'form-required-color': 'var(--cd-color-danger)',
  'form-optional-color': 'var(--cd-color-tertiary)', // Semi $color-form_label_optional-text（原 text-2）
  'form-extra-color': 'var(--cd-color-tertiary)', // Semi $color-form_label_extra-text（原 text-2）
  'form-error-color': 'var(--cd-color-danger)',
  'form-warning-color': 'var(--cd-color-warning)',
  'form-error-font-size': 'var(--cd-font-size-small)',
  'form-section-gap': 'var(--cd-spacing-base)',
} as const;
