import Form_ from './Form.svelte';
import Field from './Field.svelte';
import FieldArray from './FieldArray.svelte';
import FormInput from './FormInput.svelte';
import FormSelect from './FormSelect.svelte';
import FormCheckbox from './FormCheckbox.svelte';
import FormRadio from './FormRadio.svelte';
import FormSwitch from './FormSwitch.svelte';
import FormSlider from './FormSlider.svelte';
import FormRating from './FormRating.svelte';
import FormDatePicker from './FormDatePicker.svelte';
import FormTagInput from './FormTagInput.svelte';
import FormTreeSelect from './FormTreeSelect.svelte';
import FormCascader from './FormCascader.svelte';
import FormUpload from './FormUpload.svelte';
import FormTextArea from './FormTextArea.svelte';
import FormInputNumber from './FormInputNumber.svelte';
import FormCheckboxGroup from './FormCheckboxGroup.svelte';
import FormRadioGroup from './FormRadioGroup.svelte';
import FormTimePicker from './FormTimePicker.svelte';
import FormAutoComplete from './FormAutoComplete.svelte';
import FormPinCode from './FormPinCode.svelte';
import FormSection from './FormSection.svelte';
import FormSlot from './FormSlot.svelte';
import FormLabel from './FormLabel.svelte';
import FormErrorMessage from './FormErrorMessage.svelte';

/**
 * Form 命名空间：所有 Form.Xxx 控件都是 <Field> + 对应控件的便捷包装，
 * 接管数据流（value/onChange）。对齐 Semi 的 Form.Input / Form.Select 等用法。
 */
export const Form: typeof Form_ & {
  Field: typeof Field;
  List: typeof FieldArray;
  Input: typeof FormInput;
  Select: typeof FormSelect;
  Checkbox: typeof FormCheckbox;
  Radio: typeof FormRadio;
  Switch: typeof FormSwitch;
  Slider: typeof FormSlider;
  Rating: typeof FormRating;
  DatePicker: typeof FormDatePicker;
  TagInput: typeof FormTagInput;
  TreeSelect: typeof FormTreeSelect;
  Cascader: typeof FormCascader;
  Upload: typeof FormUpload;
  TextArea: typeof FormTextArea;
  InputNumber: typeof FormInputNumber;
  CheckboxGroup: typeof FormCheckboxGroup;
  RadioGroup: typeof FormRadioGroup;
  TimePicker: typeof FormTimePicker;
  AutoComplete: typeof FormAutoComplete;
  PinCode: typeof FormPinCode;
  Section: typeof FormSection;
  Slot: typeof FormSlot;
  Label: typeof FormLabel;
  ErrorMessage: typeof FormErrorMessage;
} = Object.assign(Form_, {
  Field,
  List: FieldArray,
  Input: FormInput,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  Radio: FormRadio,
  Switch: FormSwitch,
  Slider: FormSlider,
  Rating: FormRating,
  DatePicker: FormDatePicker,
  TagInput: FormTagInput,
  TreeSelect: FormTreeSelect,
  Cascader: FormCascader,
  Upload: FormUpload,
  TextArea: FormTextArea,
  InputNumber: FormInputNumber,
  CheckboxGroup: FormCheckboxGroup,
  RadioGroup: FormRadioGroup,
  TimePicker: FormTimePicker,
  AutoComplete: FormAutoComplete,
  PinCode: FormPinCode,
  Section: FormSection,
  Slot: FormSlot,
  Label: FormLabel,
  ErrorMessage: FormErrorMessage,
});

export {
  Field as FormField,
  FieldArray,
  FormInput,
  FormSelect,
  FormCheckbox,
  FormRadio,
  FormSwitch,
  FormSlider,
  FormRating,
  FormDatePicker,
  FormTagInput,
  FormTreeSelect,
  FormCascader,
  FormUpload,
  FormTextArea,
  FormInputNumber,
  FormCheckboxGroup,
  FormRadioGroup,
  FormTimePicker,
  FormAutoComplete,
  FormPinCode,
  FormSection,
  FormSlot,
  FormLabel,
  FormErrorMessage,
};
export { meta as formMeta } from './meta.js';
export type { FormApi, FormState, FieldErrors } from '@chenzy-design/core';
export {
  getFormContext,
  setFormContext,
  type FormContext,
  type FormLayout,
  type FormLabelPosition,
  type FormSize,
  type FormLabelAlign,
} from './context.js';
