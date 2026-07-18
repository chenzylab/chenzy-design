/**
 * Form hooks —— Svelte 等价形态（对齐 Semi useFormApi / useFormState / useFieldApi）。
 *
 * Semi 用 React hooks（useContext）拿 formApi/formState/fieldApi；Svelte 无 hooks 惯例，
 * 用 getFormContext()（组件 init 期调用，返回响应式 context）覆盖同一目的。这里提供三个
 * 薄别名/工厂降低 Semi 用户认知成本：
 *   - useFormApi()      = getFormContext()?.form               （后代拿 FormApi 句柄）
 *   - useFormState()    = getFormContext()?.getFormState()     （后代拿响应式 FormState 快照）
 *   - getFieldApi(field)= 基于 FormApi 组一层字段级 get/set 闭包（对齐 Semi useFieldApi buildFieldApi）
 *
 * 「外部预建 form + <Form form={api}>」用法：直接在组件顶层 `const form = createForm()`
 * （core 导出）传给 <Form {form}>，无需 React 的 Proxy 延迟绑定——Svelte 中 createForm()
 * 同步返回真 api，父组件立即可调。
 *
 * withField HOC：Svelte 无 HOC，用 <Form.Field>{#snippet children(...)} 惯例覆盖（受控接管
 * value/onChange），不再补通用 HOC。
 *
 * 注意：这些函数内部调用 getFormContext()（依赖 Svelte context），只能在组件 init 期
 * （<script> 顶层或 setup 阶段）调用，与 getContext 约束一致。
 */
import type { FormApi, FormState } from '@chenzy-design/core';
import { getFormContext } from './context.js';

/** 后代组件拿当前 Form 的 FormApi 句柄（对齐 Semi useFormApi）。不在 <Form> 内返回 undefined。 */
export function useFormApi(): FormApi | undefined {
  return getFormContext()?.form;
}

/**
 * 后代组件拿当前 Form 的响应式 FormState 快照（对齐 Semi useFormState）。
 * 返回的是 getter：在 $derived / 模板中调用即随表单状态更新（context 桥接保持响应式）。
 * 不在 <Form> 内返回 undefined。
 */
export function useFormState(): FormState | undefined {
  return getFormContext()?.getFormState();
}

/** 单字段 API（对齐 Semi useFieldApi 返回的 fieldApi 子集）。 */
export interface FieldApi {
  /** 读该字段当前值。 */
  getValue(): unknown;
  /** 写该字段值（可选触发校验）。 */
  setValue(value: unknown, opts?: { validate?: boolean }): void;
  /** 读该字段当前错误。 */
  getError(): string | undefined;
  /** 命令式塞入该字段错误（如后端返回校验错误，对齐 Semi setError）。 */
  setError(error: string | undefined): void;
  /** 读该字段 touched 态。 */
  getTouched(): boolean;
  /** 写该字段 touched 态。 */
  setTouched(touched?: boolean): void;
}

/**
 * 基于当前 Form context 组一个字段级 API 闭包（对齐 Semi useFieldApi(field)）。
 * 依赖 core 的 setError（批A 已补）。必须在 <Form> 后代的组件 init 期调用。
 * @throws 不在 <Form> 内使用时抛错（与 <Form.Field> 一致，避免静默拿到空 api）。
 */
export function getFieldApi(field: string): FieldApi {
  const ctx = getFormContext();
  if (!ctx) throw new Error('getFieldApi() must be used inside <Form>');
  const { form, getFormState } = ctx;
  return {
    getValue: () => form.getValue(field),
    setValue: (value, opts) => form.setValue(field, value, opts),
    getError: () => {
      const e = form.getError(field);
      return typeof e === 'string' ? e : undefined;
    },
    setError: (error) => form.setError(field, error),
    // core 无独立 getTouched；touched 经 formState 快照读取（保持响应式）。
    getTouched: () => getFormState().touched[field] === true,
    setTouched: (touched = true) => form.setTouched(field, touched),
  };
}
