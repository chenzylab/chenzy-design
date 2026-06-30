<!--
  Form.Label — see specs/components/input/Form.spec.md
  独立标签组件，与 Field 内标签样式一致，可用于自定义布局。
-->
<script lang="ts">
  interface Props {
    /** 标签文本。 */
    text?: string;
    /** 是否必填（显示 * 星标）。 */
    required?: boolean;
    /** 是否显示「可选」标记（与 required 互斥，required 优先）。 */
    optional?: boolean;
    /** 标签后补充说明文字。 */
    extra?: string;
    /** 关联控件的 id（对应 <label for>）。 */
    htmlFor?: string;
  }

  let { text, required = false, optional = false, extra, htmlFor }: Props = $props();
</script>

<label class="cd-form-field__label" for={htmlFor}>
  {#if required}
    <span aria-hidden="true" class="cd-form-field__required">*</span>
  {/if}
  {#if text !== undefined}
    <span class="cd-form-field__label-text">{text}</span>
  {/if}
  {#if !required && optional}
    <span class="cd-form-field__label-optional" aria-hidden="true">（可选）</span>
  {/if}
  {#if extra !== undefined}
    <span class="cd-form-field__label-extra">{extra}</span>
  {/if}
</label>

<style>
  .cd-form-field__label-optional {
    color: var(--cd-form-optional-color, var(--cd-color-text-3));
    font-size: var(--cd-font-size-small, 0.75rem);
  }
  .cd-form-field__label-extra {
    color: var(--cd-form-extra-color, var(--cd-color-text-3));
    font-size: var(--cd-font-size-small, 0.75rem);
  }
</style>
