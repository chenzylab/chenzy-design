import Form_ from './Form.svelte';
import Field from './Field.svelte';
import FormInput from './FormInput.svelte';
import FieldArray from './FieldArray.svelte';

export const Form: typeof Form_ & {
  Field: typeof Field;
  Input: typeof FormInput;
  List: typeof FieldArray;
} = Object.assign(Form_, { Field, Input: FormInput, List: FieldArray });

export { Field as FormField, FormInput, FieldArray };
export { meta as formMeta } from './meta.js';
export {
  getFormContext,
  setFormContext,
  type FormContext,
  type FormLayout,
  type FormLabelPosition,
  type FormSize,
  type FormLabelAlign,
} from './context.js';
