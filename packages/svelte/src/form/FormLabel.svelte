<!--
  Form.Label — see specs/components/input/Form.spec.md
  独立标签组件，与 Field 内标签样式一致，可用于自定义布局。对齐 Semi label.tsx。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 标签文本（不传时回退到 children）。 */
    text?: string | undefined;
    /** 文本对齐（默认 'left'）。 */
    align?: 'left' | 'right';
    className?: string;
    /** 禁用态样式。 */
    disabled?: boolean;
    /** label 元素 id。 */
    id?: string;
    /** 是否必填（显示 * 星标）。 */
    required?: boolean;
    /** 是否显示「可选」标记（与 required 互斥，required 优先）。 */
    optional?: boolean;
    /** 标签后补充说明文字。 */
    extra?: string;
    /** 关联控件的 id（对应 <label for>）。 */
    htmlFor?: string;
    /** 标签宽度（number → px）。 */
    width?: number | string | undefined;
    /** 透传到 <label> 的内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let {
    text,
    align = 'left',
    className,
    disabled = false,
    id,
    required = false,
    optional = false,
    extra,
    htmlFor,
    width,
    style,
    children,
  }: Props = $props();

  const loc = useLocale();

  const cls = $derived(
    [
      'cd-form-field__label',
      `cd-form-field__label--align-${align}`,
      required && 'cd-form-field__label--required',
      disabled && 'cd-form-field__label--disabled',
      extra !== undefined && 'cd-form-field__label--with-extra',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const labelStyle = $derived(
    [
      width !== undefined
        ? `inline-size:${typeof width === 'number' ? `${width}px` : width}`
        : undefined,
      style,
    ]
      .filter(Boolean)
      .join(';') || undefined,
  );
</script>

<label class={cls} for={htmlFor} {id} style={labelStyle}>
  {#if required}
    <span aria-hidden="true" class="cd-form-field__required">*</span>
  {/if}
  <span class="cd-form-field__label-text">
    {#if text !== undefined}
      {text}
    {:else}
      {@render children?.()}
    {/if}
    {#if !required && optional}
      <span class="cd-form-field__label-optional">{loc().t('Form.optional')}</span>
    {/if}
  </span>
  {#if extra !== undefined}
    <span class="cd-form-field__label-extra">{extra}</span>
  {/if}
</label>

<style>
  .cd-form-field__label--disabled {
    color: var(--cd-color-form-label-disabled-text-default, var(--cd-color-text-2));
  }
  .cd-form-field__label--disabled .cd-form-field__required {
    color: var(--cd-color-form-requiredmark-disabled-text-default, var(--cd-color-text-2));
  }
  .cd-form-field__label-optional {
    color: var(--cd-form-optional-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__label-extra {
    color: var(--cd-form-extra-color);
    font-size: var(--cd-form-error-font-size);
  }
</style>
