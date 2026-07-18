<!--
  Form.ErrorMessage — see specs/components/input/Form.spec.md
  独立错误/提示文字展示：带状态图标的错误文字，可独立放置于任意位置。对齐 Semi errorMessage.tsx。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';

  interface Props {
    /** 错误文本（字符串、字符串数组或自定义 Snippet 节点）。数组以 ', ' 连接（对齐 Semi）。 */
    error?: string | string[] | Snippet;
    className?: string;
    /** 透传到容器的内联样式。 */
    style?: string;
    /** 是否显示状态图标（默认 true，对齐 Semi showValidateIcon）。 */
    showValidateIcon?: boolean;
    /** 校验状态，决定状态图标（warning=IconAlertTriangle, error=IconAlertCircle）。 */
    validateStatus?: 'error' | 'warning';
    /** 提示文案：无 error 时展示（与 error 同块，error 优先）。 */
    helpText?: string;
    /** InputGroup 内：图标恒为 IconAlertCircle（对齐 Semi）。 */
    isInInputGroup?: boolean;
    /** error 文本的元素 id（a11y 关联）。 */
    errorMessageId?: string;
    /** helpText 文本的元素 id（a11y 关联）。 */
    helpTextId?: string;
  }

  let {
    error,
    className,
    style,
    showValidateIcon = true,
    validateStatus = 'error',
    helpText,
    isInInputGroup = false,
    errorMessageId,
    helpTextId,
  }: Props = $props();

  // error 为 Snippet 时走自定义渲染分支
  const isSnippet = $derived(typeof error === 'function');

  // 归一化为可渲染文本：数组 join(', ')、字符串原样（对齐 Semi generatorText）。
  const errorText = $derived(
    error === undefined || isSnippet
      ? undefined
      : Array.isArray(error)
        ? error.filter(Boolean).join(', ')
        : error,
  );

  const hasError = $derived(isSnippet || (errorText !== undefined && errorText !== ''));
  // 无 error 时展示 helpText。
  const showHelp = $derived(!hasError && helpText !== undefined && helpText !== '');
  const textId = $derived(hasError ? errorMessageId : helpTextId);
  // InputGroup 内图标恒为 error 图标；否则按 validateStatus 决定。
  const iconIsWarning = $derived(!isInInputGroup && validateStatus === 'warning');
</script>

{#if hasError || showHelp}
  <div
    class={[
      hasError ? 'cd-form-field__error' : 'cd-form-field__help-text',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    role={hasError ? 'alert' : undefined}
    {style}
  >
    {#if showValidateIcon && hasError}
      {#if iconIsWarning}
        <IconAlertTriangle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
      {:else}
        <IconAlertCircle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
      {/if}
    {/if}
    {#if isSnippet}
      {@render (error as Snippet)()}
    {:else}
      <span id={textId}>{hasError ? errorText : helpText}</span>
    {/if}
  </div>
{/if}

<style>
  .cd-form-field__help-text {
    color: var(--cd-form-extra-color);
    font-size: var(--cd-form-error-font-size);
  }
</style>
