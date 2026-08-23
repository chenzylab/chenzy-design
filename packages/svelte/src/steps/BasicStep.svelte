<!--
  BasicStep — 严格对齐 Semi basicStep.tsx + basicSteps.tsx 状态推断逻辑（type="basic"）。
  Svelte 无 cloneElement，子项自身从 context 读取 current/status/size/onChange 并结合
  声明式登记（index/total）算出 stepNumber/status/active/done/next-error，等价于 Semi
  父组件 useMemo 遍历 children 逐一计算的效果。
  DOM：
    div.item.item-{status}[.item-active][.item-done][.item-clickable][.item-hover][.item-{status}-hover]
      > .item-container > .item-left(> span.item-icon[.item-custom-icon][.item-icon-process] > .item-number-icon | 具名图标)
                        + .item-content > .item-title(> .item-title-text[.item-title-text-empty])
                                        + (description && .item-description)
  tabIndex 恒为 0，aria-current="step" 恒定输出（对齐 Semi，不判断 active）。
-->
<script lang="ts" module>
  export const stepSizeMapIconSize = { small: 'large', default: 'extra-large' } as const;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconTickCircle, IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { getStepsContext } from './context.js';
  import type { StepProps, StepStatus } from './types.js';

  let {
    title,
    description,
    icon,
    status: statusProp,
    class: className,
    style,
    role,
    'aria-label': ariaLabel,
    onClick,
    onKeyDown,
  }: StepProps = $props();

  const ctx = getStepsContext();

  // 同步注册（非 $effect 延后注册）：避免注册前的一帧空窗期（index/total 退回默认值
  // 导致 fill 型宽度、nav 型 chevron 判断在首帧短暂出现错误中间态）。$effect 仅负责
  // 组件销毁时的 unregister 清理。
  const handle = ctx?.registerStep?.() ?? null;
  $effect(() => {
    return () => handle?.unregister();
  });
  const index = $derived(handle?.getIndex() ?? 0);

  const size = $derived(ctx?.getSize() ?? 'default');
  const current = $derived(ctx?.getCurrent() ?? 0);
  const initial = $derived(ctx?.getInitial() ?? 0);
  const topStatus = $derived(ctx?.getStatus() ?? 'process');
  const prefixCls = $derived(ctx?.getPrefixCls() ?? 'cd-steps');
  const onChangeTop = $derived(ctx?.getOnChange());

  const stepNumber = $derived(initial + index);
  const status = $derived.by<StepStatus>(() => {
    if (statusProp) return statusProp;
    if (stepNumber === current) return topStatus;
    if (stepNumber < current) return 'finish';
    return 'wait';
  });
  const active = $derived(stepNumber === current);
  const done = $derived(stepNumber < current);
  const isNextError = $derived(topStatus === 'error' && index === current - 1);

  const numberText = $derived(String(stepNumber + 1));

  function isStringNode(v: unknown): v is string {
    return typeof v === 'string';
  }
  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const hasCustomIcon = $derived(icon !== undefined);
  const progress = $derived(status === 'process');
  const iconCls = $derived(
    ['cd-steps-item-icon', hasCustomIcon && 'cd-steps-item-custom-icon', progress && 'cd-steps-item-icon-process']
      .filter(Boolean)
      .join(' '),
  );

  const onChange = $derived(onChangeTop ? () => onChangeTop(index + initial) : undefined);

  // next-error：status='error' 且本步为 current 前一步时，next-error 类追加在完整
  // class 串末尾（对齐 Semi：childProps.className 只是 cloneElement 传给子组件的
  // className prop，子组件内部用 classnames(prefixCls, ...状态类, className) 追加，
  // 不会覆盖基础类，故 next-error 不影响 flex:1 等布局）。
  const itemCls = $derived(
    [
      'cd-steps-item',
      `cd-steps-item-${status}`,
      active && 'cd-steps-item-active',
      done && 'cd-steps-item-done',
      (onChange || onClick) && 'cd-steps-item-hover',
      (onChange || onClick) && 'cd-steps-item-clickable',
      (onChange || onClick) && `cd-steps-item-${status}-hover`,
      isNextError && `${prefixCls}-next-error`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

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

  const titleTextClass = $derived(
    ['cd-steps-item-title-text', !title && 'cd-steps-item-title-text-empty'].filter(Boolean).join(' '),
  );
</script>

<!-- role 为可选 string prop（对齐 Semi，消费方自行传入），svelte-check 无法从类型
     静态确认恒为 interactive role，保守报 a11y_no_noninteractive_tabindex，误报。 -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  {role}
  aria-label={ariaLabel}
  tabindex="0"
  aria-current="step"
  class={itemCls}
  {style}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <div class="cd-steps-item-container">
    <div class="cd-steps-item-left">
      {#if hasCustomIcon}
        <span class={iconCls}>
          {#if isStringNode(icon)}{icon}{:else if isSnippet(icon)}{@render icon()}{/if}
        </span>
      {:else if status === 'error'}
        <span class={iconCls}><IconAlertCircle size={stepSizeMapIconSize[size]} /></span>
      {:else if status === 'wait' || status === 'process'}
        <span class={iconCls}><span class="cd-steps-item-number-icon">{numberText}</span></span>
      {:else if status === 'finish'}
        <span class={iconCls}><IconTickCircle size={stepSizeMapIconSize[size]} /></span>
      {:else if status === 'warning'}
        <span class={iconCls}><IconAlertTriangle size={stepSizeMapIconSize[size]} /></span>
      {/if}
    </div>
    <div class="cd-steps-item-content">
      <div class="cd-steps-item-title">
        <div class={titleTextClass}>
          {#if isStringNode(title)}{title}{:else if isSnippet(title)}{@render title()}{/if}
        </div>
      </div>
      {#if description}
        <div class="cd-steps-item-description">
          {#if isStringNode(description)}{description}{:else if isSnippet(description)}{@render description()}{/if}
        </div>
      {/if}
    </div>
  </div>
</div>
