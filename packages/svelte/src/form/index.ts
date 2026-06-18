import Form_ from './Form.svelte';
import Field from './Field.svelte';
import FormInput from './FormInput.svelte';

export const Form: typeof Form_ & { Field: typeof Field; Input: typeof FormInput } =
  Object.assign(Form_, { Field, Input: FormInput });

export { Field as FormField, FormInput };
export { meta as formMeta } from './meta.js';
export {
  getFormContext,
  setFormContext,
  type FormContext,
  type FormLayout,
  type FormLabelPosition,
  type FormSize,
} from './context.js';
