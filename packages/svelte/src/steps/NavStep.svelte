<!--
  NavStep — 严格对齐 Semi navStep.tsx（type="nav"）。无 status/description/icon（Semi
  NavStepProps 不含这些字段）。DOM：
    div.item[.item-active] > .item-container > .item-content > .item-title
                                              + (非末项) .item-icon > IconChevronRight
  tabIndex 恒为 0，aria-current="step" 恒定输出。title 无 title-text 内层包裹（对齐 Semi）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconChevronRight } from '@chenzy-design/icons';
  import { getStepsContext } from './context.js';
  import type { StepProps } from './types.js';

  let {
    title,
    class: className,
    style,
    role,
    'aria-label': ariaLabel,
    onClick,
    onKeyDown,
  }: StepProps = $props();

  const ctx = getStepsContext();

  // 同步注册（非 $effect 延后注册）：避免注册前的一帧空窗期（total 退回默认值 1 导致
  // last=index===total-1 恒真，chevron 分隔符在首帧短暂消失）。$effect 仅负责组件销毁时
  // 的 unregister 清理。
  const handle = ctx?.registerStep?.() ?? null;
  $effect(() => {
    return () => handle?.unregister();
  });
  const index = $derived(handle?.getIndex() ?? 0);
  const total = $derived(handle?.getTotal() ?? 1);

  const current = $derived(ctx?.getCurrent() ?? 0);
  const initial = $derived(ctx?.getInitial() ?? 0);
  const onChangeTop = $derived(ctx?.getOnChange());

  const active = $derived(index === current);
  const last = $derived(index === total - 1);
  const onChange = $derived(onChangeTop ? () => onChangeTop(index + initial) : undefined);

  function isStringNode(v: unknown): v is string {
    return typeof v === 'string';
  }
  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const itemCls = $derived(['cd-steps-item', active && 'cd-steps-item-active', className].filter(Boolean).join(' '));

  function handleClick(e: MouseEvent) {
    onClick?.(e);
    onChange?.();
  }
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      onKeyDown?.(e);
      onChange?.();
    }
  }
</script>

<div
  {role}
  aria-label={ariaLabel}
  aria-current="step"
  tabindex="0"
  class={itemCls}
  {style}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <div class="cd-steps-item-container">
    <div class="cd-steps-item-content">
      <div class="cd-steps-item-title">
        {#if isStringNode(title)}{title}{:else if isSnippet(title)}{@render title()}{/if}
      </div>
    </div>
    {#if !last}
      <div class="cd-steps-item-icon"><IconChevronRight size="small" /></div>
    {/if}
  </div>
</div>
