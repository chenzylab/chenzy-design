/**
 * 共享的 field-level props 契约 —— 对齐 Semi withField HOC 的透传语义。
 *
 * Semi 的 `withField(Comp)` 把一整套 field-level props（label / labelPosition /
 * noLabel / helpText / rules / trigger / ...）从合并 props 里解构出来交给内部 Field，
 * 剩下的 `rest` 透传给被包裹的控件。本库无 HOC，用 Form* 薄封装等价（Field snippet +
 * 控件），但每个封装若手动逐个列 field prop，Field 每新增一个 prop 就要同步 ~16 个封装，
 * 极易漏（批C 补了 Field 的 helpText/labelPosition/noLabel 等却漏了封装透传，真机才暴露）。
 *
 * 这里集中定义：
 *  - `FieldPassthroughProps`：所有 field-level props 的类型（Form* 封装 `extends` 它）。
 *  - `FIELD_PROP_KEYS`：运行时 key 白名单，`splitFieldProps` 据此把合并 props 分成
 *    「给 Field 的 field props」+「给控件的 rest」，对齐 Semi withField 的解构。
 *
 * Form* 封装用法：
 *   interface Props extends FieldPassthroughProps { placeholder?: string; ... }
 *   const { fieldProps, rest } = $derived(splitFieldProps(props));
 *   <Field {...fieldProps}>{#snippet children(...)}<Control {...rest} .../>{/snippet}</Field>
 */
import type { Rule, ValidateTrigger } from '@chenzy-design/core';
import type { FormLabelPosition, FormLabelAlign } from './context.js';

/** label 对象形态（对齐 Semi LabelProps 的可传对象）。 */
export interface FieldLabelProps {
  text?: string;
  align?: FormLabelAlign;
  width?: number | string;
  required?: boolean;
  [key: string]: unknown;
}

/**
 * Field 认的全部 field-level props（对齐 Semi CommonFieldProps）。Form* 封装 `extends`
 * 它即自动获得完整 field 能力,无需逐个列。新增 field prop 只改这里 + Field.svelte + KEYS。
 */
export interface FieldPassthroughProps {
  field: string;
  label?: string | FieldLabelProps;
  labelPosition?: FormLabelPosition;
  labelAlign?: FormLabelAlign;
  labelWidth?: number | string;
  noLabel?: boolean;
  noErrorMessage?: boolean;
  name?: string;
  fieldClassName?: string;
  fieldStyle?: string;
  helpText?: string;
  extraTextPosition?: 'middle' | 'bottom';
  pure?: boolean;
  isInInputGroup?: boolean;
  rules?: Rule[];
  initValue?: unknown;
  required?: boolean;
  validateStatus?: 'default' | 'warning' | 'error';
  extraText?: string;
  noStyle?: boolean;
  span?: number;
  transform?: (value: unknown, values: Record<string, unknown>) => unknown;
  valuePropName?: string;
  dependencies?: string[];
  trigger?: ValidateTrigger | ValidateTrigger[];
  allowEmptyString?: boolean;
  convert?: (value: unknown) => unknown;
  keepState?: boolean;
  /** 允许封装 extends 后再加控件专属 props(经 splitFieldProps 分离到 rest)。 */
  [key: string]: unknown;
}

/**
 * field-level prop 的 key 白名单。`splitFieldProps` 据此从合并 props 分离出 field props。
 * 必须与 `FieldPassthroughProps` 的键 + Field.svelte 的 Props 保持同步。
 */
export const FIELD_PROP_KEYS = [
  'field',
  'label',
  'labelPosition',
  'labelAlign',
  'labelWidth',
  'noLabel',
  'noErrorMessage',
  'name',
  'fieldClassName',
  'fieldStyle',
  'helpText',
  'extraTextPosition',
  'pure',
  'isInInputGroup',
  'rules',
  'initValue',
  'required',
  'validateStatus',
  'extraText',
  'noStyle',
  'span',
  'transform',
  'valuePropName',
  'dependencies',
  'trigger',
  'allowEmptyString',
  'convert',
  'keepState',
] as const;

const FIELD_PROP_KEY_SET = new Set<string>(FIELD_PROP_KEYS);

/**
 * 把合并后的 props 分成「给 Field 的 field props」+「给控件的 rest」（对齐 Semi withField
 * 的解构语义）。只把已定义（非 undefined）的 field key 放进 fieldProps，避免向可选 prop
 * 传显式 undefined（exactOptionalPropertyTypes）。
 */
export function splitFieldProps(props: FieldPassthroughProps & Record<string, unknown>): {
  fieldProps: FieldPassthroughProps;
  rest: Record<string, unknown>;
} {
  const fieldProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const key in props) {
    const value = (props as Record<string, unknown>)[key];
    if (FIELD_PROP_KEY_SET.has(key)) {
      if (value !== undefined) fieldProps[key] = value;
    } else if (value !== undefined) {
      rest[key] = value;
    }
  }
  // field 是必填,for-in 已从 props 拷入(props.field 必有值),类型上断言回 FieldPassthroughProps。
  return { fieldProps: fieldProps as unknown as FieldPassthroughProps, rest };
}
