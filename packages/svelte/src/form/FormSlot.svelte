<!--
  Form.Slot — see specs/components/input/Form.spec.md
  布局占位容器：与普通 Field 相同的布局，但不接管 value/onChange，纯布局占位。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getFormContext, type FormLabelPosition, type FormLabelAlign } from './context.js';

  interface Props {
    /** 标签文本。 */
    label?: string;
    /** 标签位置覆盖（不传则继承 Form 配置）。 */
    labelPosition?: FormLabelPosition;
    /** 标签对齐覆盖（不传则继承 Form 配置）。 */
    labelAlign?: FormLabelAlign;
    /** 隐藏标签区域（仍保留布局对齐占位）。 */
    noLabel?: boolean;
    children?: Snippet;
  }

  let { label, labelPosition, labelAlign, noLabel = false, children }: Props = $props();

  const ctx = getFormContext();

  const resolvedLabelPosition = $derived(labelPosition ?? ctx?.getLabelPosition() ?? 'top');
  const resolvedLabelAlign = $derived(labelAlign ?? ctx?.getLabelAlign() ?? 'left');

  const cls = $derived(
    [
      'cd-form-field',
      `cd-form-field--label-${resolvedLabelPosition}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls}>
  {#if !noLabel}
    <div
      class="cd-form-field__label cd-form-field__label--align-{resolvedLabelAlign}"
    >
      {#if label !== undefined}
        <span class="cd-form-field__label-text">{label}</span>
      {/if}
    </div>
  {/if}
  <div class="cd-form-field__control">
    {@render children?.()}
  </div>
</div>
