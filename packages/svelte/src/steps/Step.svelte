<!--
  Steps.Step — 严格对齐 Semi step.tsx（basicStep/fillStep/navStep 三型），DOM class 层级镜像 Semi。
  经 context 从父 Steps 拿 type/size/direction/current/initial/status/onChange 与自身顺序索引。
  DOM（前缀 cd-steps-item，对齐 Semi semi-steps-item）：
    basic：li.item.item-{st}[…] > .item-container > .item-left(> .item-icon[> .item-number-icon | custom]) + .item-content > .item-title(> .item-title-text) + .item-description
    fill ：li.item.item-{st}[…] > .item-left(.item-plain | .item-icon) + .item-content > .item-title(> .item-title-text) + .item-description
    nav  ：li.item[.item-active] > .item-container > .item-content > .item-title + (非末项).item-icon(chevron)
  可点击（fill/basic + onChange）时 li 内为原生 button（roving tabindex 单 Tab 停靠点）；nav 不可交互。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { IconTickCircle, IconAlertCircle, IconAlertTriangle, IconChevronRight } from '@chenzy-design/icons';
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
    ariaLabel,
    onClick,
    onKeyDown,
  }: StepProps = $props();

  const ctx = getStepsContext();

  // 声明式登记：getIndex 反映本项在兄弟中的顺序索引，getTotal 反映兄弟总数。
  let handle = $state<{ getIndex: () => number; getTotal: () => number; unregister: () => void } | null>(null);
  $effect(() => {
    const reg = ctx?.registerStep;
    if (!reg) return;
    const r = untrack(() => reg());
    handle = r;
    return () => {
      r.unregister();
      handle = null;
    };
  });
  const index = $derived(handle?.getIndex() ?? 0);
  const total = $derived(handle?.getTotal() ?? 1);

  const type = $derived(ctx?.getType() ?? 'fill');
  const size = $derived(ctx?.getSize() ?? 'default');
  const current = $derived(ctx?.getCurrent() ?? 0);
  const initial = $derived(ctx?.getInitial() ?? 0);
  const topStatus = $derived(ctx?.getStatus() ?? 'process');
  const clickable = $derived(ctx?.getClickable() ?? false);

  // 状态推断（对齐 Semi basicSteps/fillSteps）：显式 status 优先，否则由 current 推断。
  // stepNumber = initial + index（绝对序号）；current 也是绝对值。
  const stepNumber = $derived(initial + index);
  const st = $derived.by<StepStatus>(() => {
    if (statusProp) return statusProp;
    if (stepNumber === current) return topStatus;
    if (stepNumber < current) return 'finish';
    return 'wait';
  });
  const active = $derived(stepNumber === current);
  const done = $derived(stepNumber < current);
  const last = $derived(index === total - 1);

  // 序号显示文本（Semi 显示 stepNumber+1）。
  const numberText = $derived(String(stepNumber + 1));

  function isStringIcon(v: unknown): v is string {
    return typeof v === 'string';
  }
  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  // 是否渲染圆底序号（basic）/纯序号（fill）：仅 wait/process 且无自定义 icon。
  const hasNumberIcon = $derived(icon === undefined && (st === 'wait' || st === 'process'));

  // li 根 class（对齐 Semi item + item-{status} + active/done/clickable/hover）。
  const itemCls = $derived(
    [
      'cd-steps-item',
      `cd-steps-item-${st}`,
      active && 'cd-steps-item-active',
      done && 'cd-steps-item-done',
      clickable && 'cd-steps-item-clickable',
      clickable && 'cd-steps-item-hover',
      clickable && `cd-steps-item-${st}-hover`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function select() {
    if (!clickable) return;
    if (index === current - initial) return; // 同当前步不触发
    ctx?.getOnChange()?.(index + initial);
  }

  // roving：本步 tabindex（0 = Tab 停靠点，-1 = 其余）。
  const focusedIndex = $derived(ctx?.getFocusedIndex() ?? -1);
  const tabindex = $derived.by<0 | -1>(() => {
    if (!clickable) return -1;
    const anchor = focusedIndex >= 0 ? focusedIndex : current - initial;
    const resolved = anchor >= 0 && anchor < total ? anchor : 0;
    return index === resolved ? 0 : -1;
  });

  function onHeadKeydown(e: KeyboardEvent) {
    onKeyDown?.(e);
    const k = e.key;
    // 方向键漫游（横/纵）：Semi 仅 Enter 激活，此处补 roving 对齐本库 a11y。
    // 无 wrap：两端 clamp（对齐旧实现 nextRovingIndex(...,false)）。
    let next: number | null = null;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = Math.min(index + 1, total - 1);
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = Math.max(index - 1, 0);
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = total - 1;
    if (next !== null) {
      e.preventDefault();
      ctx?.focusStep(next);
    }
  }

  const srText = $derived(ctx?.srLabel(index, total, st) ?? '');
</script>

{#snippet iconNode()}
  {#if type === 'nav'}
    <!-- nav 型无左侧图标节点（图标是末项之后的 chevron，见下方 container） -->
  {:else if type === 'fill'}
    <!-- fill：左侧节点直接在 item 下（无 container）；plain=纯序号，icon=自定义，否则形状图标 -->
    {#if hasNumberIcon}
      <div class="cd-steps-item-left cd-steps-item-plain" class:cd-steps-item-left-process={st === 'process'} aria-hidden="true">{numberText}</div>
    {:else}
      <div class="cd-steps-item-left cd-steps-item-icon" aria-hidden="true">
        {#if icon !== undefined}
          {#if isStringIcon(icon)}{icon}{:else if isSnippet(icon)}{@render icon()}{/if}
        {:else if st === 'finish'}<IconTickCircle size="inherit" aria-hidden="true" />
        {:else if st === 'error'}<IconAlertCircle size="inherit" aria-hidden="true" />
        {:else if st === 'warning'}<IconAlertTriangle size="inherit" aria-hidden="true" />
        {/if}
      </div>
    {/if}
  {:else}
    <!-- basic：.item-left > .item-icon [> .item-number-icon | 形状/自定义图标] -->
    <div class="cd-steps-item-left">
      <div class="cd-steps-item-icon" class:cd-steps-item-icon-process={st === 'process'} class:cd-steps-item-custom-icon={icon !== undefined} aria-hidden="true">
        {#if hasNumberIcon}
          <span class="cd-steps-item-number-icon">{numberText}</span>
        {:else if icon !== undefined}
          {#if isStringIcon(icon)}{icon}{:else if isSnippet(icon)}{@render icon()}{/if}
        {:else if st === 'finish'}<IconTickCircle size="inherit" aria-hidden="true" />
        {:else if st === 'error'}<IconAlertCircle size="inherit" aria-hidden="true" />
        {:else if st === 'warning'}<IconAlertTriangle size="inherit" aria-hidden="true" />
        {/if}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet titleText()}
  <span class="cd-steps-item-title-text" class:cd-steps-item-title-text-empty={!title}>
    {#if isStringIcon(title)}{title}{:else if isSnippet(title)}{@render title()}{/if}
  </span>
{/snippet}

{#snippet descNode()}
  {#if description}
    <div class="cd-steps-item-description">
      {#if isStringIcon(description)}{description}{:else if isSnippet(description)}{@render description()}{/if}
    </div>
  {/if}
{/snippet}

{#snippet body()}
  {#if type === 'nav'}
    <div class="cd-steps-item-container">
      <div class="cd-steps-item-content">
        <div class="cd-steps-item-title">{@render titleText()}</div>
      </div>
      {#if !last}
        <div class="cd-steps-item-icon" aria-hidden="true"><IconChevronRight size="small" aria-hidden="true" /></div>
      {/if}
    </div>
  {:else if type === 'fill'}
    {@render iconNode()}
    <div class="cd-steps-item-content">
      <div class="cd-steps-item-title">{@render titleText()}</div>
      {@render descNode()}
    </div>
  {:else}
    <!-- basic：外层 container 包裹 left + content（对齐 Semi basicStep DOM） -->
    <div class="cd-steps-item-container">
      {@render iconNode()}
      <div class="cd-steps-item-content">
        <div class="cd-steps-item-title">{@render titleText()}</div>
        {@render descNode()}
      </div>
    </div>
  {/if}
  <!-- WCAG 1.4.1：视觉隐藏「步骤 N，共 M 步，<状态>」（颜色非唯一信息载体）。 -->
  <span class="cd-sr-only">{srText}</span>
{/snippet}

<li class={itemCls} {style}>
  {#if clickable}
    <button
      type="button"
      class="cd-steps-item-head"
      data-step-index={index}
      {role}
      aria-label={ariaLabel}
      aria-current={active ? 'step' : undefined}
      {tabindex}
      onclick={(e) => {
        onClick?.(e);
        select();
      }}
      onkeydown={onHeadKeydown}
      onfocus={() => ctx?.setFocusedIndex(index)}
    >
      {@render body()}
    </button>
  {:else}
    <div
      class="cd-steps-item-head"
      role={role ?? undefined}
      aria-label={ariaLabel}
      aria-current={active ? 'step' : undefined}
    >
      {@render body()}
    </div>
  {/if}
</li>
