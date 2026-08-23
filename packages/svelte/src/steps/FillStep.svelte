<!--
  FillStep — 严格对齐 Semi fillStep.tsx + fillSteps.tsx 状态推断逻辑（type="fill"，默认）。
  自身包一层 <Col>（对齐 Semi fillSteps.tsx 用 <Col style={colStyle}> 包裹每个 child；
  横向时 width=100/count%，纵向不设宽度），故 FillSteps 容器里 Row 的直接子节点仍逐个是 Col。
  DOM（Col 内）：
    div.item.item-{status}.item-{status}-hover.item-{status}-active[.item-clickable]
      > div.item-left(.item-plain | .item-icon)[.item-icon-process][.item-hover]
      + div.item-content > div.item-title[title]（> span.item-title-text）
                         + div.item-description[title]（恒定渲染，非条件）
  tabIndex 恒为 0，aria-current="step" 恒定输出。图标恒定 size="extra-large"（无 size prop）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconTickCircle, IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { Col } from '../grid/index.js';
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

  // 同步注册（非 $effect 延后注册）：避免注册前的一帧空窗期（total 退回默认值 1
  // 导致 fill 型等分宽度在首帧短暂计算错误）。$effect 仅负责组件销毁时的 unregister 清理。
  const handle = ctx?.registerStep?.() ?? null;
  $effect(() => {
    return () => handle?.unregister();
  });
  const index = $derived(handle?.getIndex() ?? 0);
  const total = $derived(handle?.getTotal() ?? 1);

  const direction = $derived(ctx?.getDirection() ?? 'horizontal');
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
  const isNextError = $derived(topStatus === 'error' && index === current - 1);

  const numberText = $derived(String(stepNumber + 1));

  function isStringNode(v: unknown): v is string {
    return typeof v === 'string';
  }
  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }
  const titleIsString = $derived(isStringNode(title));
  const descriptionIsString = $derived(isStringNode(description));

  const hasCustomIcon = $derived(icon !== undefined);
  const progress = $derived(status === 'process');
  const onChange = $derived(onChangeTop ? () => onChangeTop(index + initial) : undefined);

  const leftCls = $derived(
    [
      `${prefixCls}-item-left`,
      hasCustomIcon ? `${prefixCls}-item-icon` : `${prefixCls}-item-plain`,
      progress && `${prefixCls}-item-icon-process`,
      (onChange || onClick) && `${prefixCls}-item-hover`,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // Semi Boolean(status) 恒真（status 有默认值），故 -hover/-active 两类恒随 clickable 挂钩。
  // next-error 追加在完整 class 串末尾（对齐 Semi，非整体替换，见 basicStep 同款注释）。
  const itemCls = $derived(
    [
      'cd-steps-item',
      `cd-steps-item-${status}`,
      (onChange || onClick) && `cd-steps-item-${status}-hover`,
      (onChange || onClick) && `cd-steps-item-${status}-active`,
      (onChange || onClick) && 'cd-steps-item-clickable',
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

  const colStyle = $derived(direction === 'vertical' ? '' : `width:${100 / total}%`);
</script>

<Col style={colStyle}>
  <!-- role 为可选 string prop（对齐 Semi，消费方自行传入），svelte-check 无法从类型
       静态确认恒为 interactive role，保守报 a11y_no_noninteractive_tabindex，误报。 -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
    {#if hasCustomIcon}
      <div class={leftCls}>
        {#if isStringNode(icon)}{icon}{:else if isSnippet(icon)}{@render icon()}{/if}
      </div>
    {:else if status === 'error'}
      <div class={leftCls}><IconAlertCircle size="extra-large" /></div>
    {:else if status === 'wait' || status === 'process'}
      <div class={leftCls}>{numberText}</div>
    {:else if status === 'finish'}
      <div class={leftCls}><IconTickCircle size="extra-large" /></div>
    {:else if status === 'warning'}
      <div class={leftCls}><IconAlertTriangle size="extra-large" /></div>
    {/if}
    <div class="cd-steps-item-content">
      <div class="cd-steps-item-title" title={titleIsString ? (title as string) : undefined}>
        <span class="cd-steps-item-title-text">
          {#if titleIsString}{title}{:else if isSnippet(title)}{@render title()}{/if}
        </span>
      </div>
      <div class="cd-steps-item-description" title={descriptionIsString ? (description as string) : undefined}>
        {#if descriptionIsString}{description}{:else if isSnippet(description)}{@render description()}{/if}
      </div>
    </div>
  </div>
</Col>
