<!--
  Form.ErrorMessage — see specs/components/input/Form.spec.md
  独立错误文字展示：带错误图标的错误文字，可独立放置于任意位置。
-->
<script lang="ts">
  interface Props {
    /** 错误文本（字符串或字符串数组）。 */
    error?: string | string[];
    className?: string;
    /** 是否显示错误图标（默认 true）。 */
    showIcon?: boolean;
  }

  let { error, className, showIcon = true }: Props = $props();

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
      <svg
        class="cd-form-field__status-icon"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5h1.5v5h-1.5v-5ZM8 12.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
        />
      </svg>
    {/if}
    <span>{msg}</span>
  </div>
{/each}
