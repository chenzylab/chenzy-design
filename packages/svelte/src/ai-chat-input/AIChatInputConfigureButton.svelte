<!--
  AIChatInputConfigureButton — 配置区开关按钮字段（阶段 4，对齐 Semi Configure.Button）。
  点击在 true/false 间切换，写回 value[field]；active 态用 aria-pressed + 类名标记。
  用于「联网 / 深度思考」等布尔开关。放在 AIChatInput 的 renderConfigureArea 里使用。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { getConfigureContext } from './configure-context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: boolean;
    /** 按钮文案。 */
    children?: Snippet;
    /** 前置图标（对齐 Semi Configure.Button 透传底层 Button 的 icon）。 */
    icon?: Snippet;
    /** 附加变更回调。 */
    onChange?: ((value: boolean) => void) | undefined;
    /** 禁用。 */
    disabled?: boolean;
    /** 附加类名（与组件固有类名合并，对齐 Semi getConfigureItem 的 cls 合并）。 */
    class?: string;
  }

  let {
    field,
    initValue,
    children,
    icon,
    onChange,
    disabled = false,
    class: className,
  }: Props = $props();

  const ctx = getConfigureContext();

  // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state → snippet 重渲染 → 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const active = $derived(!!ctx?.getValue()[field]);

  function handleClick(): void {
    const next = !active;
    ctx?.setField({ [field]: next });
    onChange?.(next);
  }
</script>

<button
  type="button"
  class={['cd-ai-chat-input-footer-configure-button', className].filter(Boolean).join(' ')}
  class:cd-ai-chat-input-footer-configure-button-active={active}
  aria-pressed={active}
  {disabled}
  onclick={handleClick}
>
  {#if icon}{@render icon()}{/if}
  {#if children}{@render children()}{/if}
</button>

<style>
  .cd-ai-chat-input-footer-configure-button {
    appearance: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: var(--cd-ai-chat-input-action-padding) var(--cd-spacing-tight);
    border: var(--cd-width-ai-chat-input-footer-configure-button-border) solid
      var(--cd-color-border);
    border-radius: var(--cd-ai-chat-input-action-radius);
    background: transparent;
    color: var(--cd-ai-chat-input-template-color);
    font: inherit;
    transition:
      background var(--cd-ai-chat-input-motion-duration) ease,
      border-color var(--cd-ai-chat-input-motion-duration) ease,
      color var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input-footer-configure-button:hover:not(:disabled) {
    background: var(--cd-ai-chat-input-template-bg-hover);
  }

  /* 激活态三色走 Semi 的专属变量（值与原来写死的一致，但此前对不上 Semi 变量表、
     外部也改不动）。 */
  .cd-ai-chat-input-footer-configure-button-active {
    border-color: var(--cd-color-ai-chat-input-footer-configure-button-border-active);
    background: var(--cd-color-ai-chat-input-footer-configure-button-bg);
    color: var(--cd-color-ai-chat-input-footer-configure-button-text);
  }

  .cd-ai-chat-input-footer-configure-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .cd-ai-chat-input-footer-configure-button:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
