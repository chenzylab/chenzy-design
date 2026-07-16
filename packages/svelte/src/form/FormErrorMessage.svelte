<!--
  Form.ErrorMessage — see specs/components/input/Form.spec.md
  独立错误文字展示：带错误图标的错误文字，可独立放置于任意位置。
-->
<script lang="ts">
  import { IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';

  interface Props {
    /** 错误文本（字符串或字符串数组）。 */
    error?: string | string[];
    className?: string;
    /** 是否显示错误图标（默认 true）。 */
    showIcon?: boolean;
    /** 校验状态，决定状态图标（对齐 Semi：warning=IconAlertTriangle, error=IconAlertCircle）。 */
    validateStatus?: 'error' | 'warning';
  }

  let { error, className, showIcon = true, validateStatus = 'error' }: Props = $props();

  const messages = $derived(
    error === undefined
      ? []
      : Array.isArray(error)
        ? error
        : [error],
  );
</script>

{#each messages as msg (msg)}
  <div class={['cd-form-field__error', className].filter(Boolean).join(' ')} role="alert">
    {#if showIcon}
      {#if validateStatus === 'warning'}
        <IconAlertTriangle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
      {:else}
        <IconAlertCircle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
      {/if}
    {/if}
    <span>{msg}</span>
  </div>
{/each}
