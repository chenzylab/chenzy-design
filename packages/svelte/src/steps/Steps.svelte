<!--
  Steps — 全面对齐 Semi Design（semi-foundation/steps）。
  三型：
    fill  — 旧版默认，整块带边框/圆角/内边距的块状步骤，process 态 item 背景高亮，
            左侧 24×24 圆序号；有 onChange 时可点击，hover/active 变色。
    basic — 新版简洁型，number-icon 圆序号 + 标题/描述 + 连接线（hasLine 控制）；
            有 onChange 时可点击。finish 段连接线高亮 primary。
    nav   — 导航型，序号 + 标题，内容撑开宽度，不可交互，active 态标题变色加粗。
  status：wait/process/finish/error/warning，可由 current 推断或经 step.status 显式覆盖。
  icon：每步独立（StepItem.icon，string 或 Snippet），提供时替代默认序号/✓/✕/⚠。
  a11y：ol/li 结构；可点击步为原生 button，roving tabindex 单 Tab 停靠点，
        方向键/Home/End 漫游，Enter/Space + 点击触发 onChange。
-->
<script lang="ts">
  import { nextRovingIndex, rovingKeyFromEvent, type RovingKey } from '@chenzy-design/core';
  import { IconTickCircle, IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import type { StepItem, StepStatus } from './types.js';

  type StepDirection = 'horizontal' | 'vertical';
  type StepType = 'fill' | 'basic' | 'nav';
  type StepSize = 'small' | 'default';

  interface Props {
    current?: number;
    defaultCurrent?: number;
    steps?: StepItem[];
    direction?: StepDirection;
    type?: StepType;
    status?: StepStatus;
    size?: StepSize;
    initial?: number;
    /** basic 型是否显示连接线（对齐 Semi hasLine，默认 true） */
    hasLine?: boolean;
    onChange?: (current: number) => void;
    class?: string;
  }

  let {
    current,
    defaultCurrent = 0,
    steps = [],
    direction = 'horizontal',
    type = 'fill',
    status = 'process',
    size = 'default',
    initial = 0,
    hasLine = true,
    onChange,
    class: className = '',
  }: Props = $props();

  // 受控 / 非受控（红线 #1）：绝不写回 prop。
  const isControlled = $derived(current !== undefined);
  // 函数包装读取 defaultCurrent：非受控 inner 只取初始值，不跟随 prop 变化（预期行为），
  // 同时避免 state_referenced_locally 告警。
  let inner = $state(getInitialCurrent());
  const activeIndex = $derived(isControlled ? (current as number) : inner);

  function getInitialCurrent(): number {
    return defaultCurrent;
  }

  // 可交互性对齐 Semi：fill/basic 且传入 onChange 时可点击；nav 永不可交互。
  const isClickable = $derived(type !== 'nav' && onChange !== undefined);

  function statusOf(index: number): StepStatus {
    // 显式 step.status 优先于由 current 推断的状态
    const explicit = steps[index]?.status;
    if (explicit) return explicit;
    if (index < activeIndex) return 'finish';
    if (index === activeIndex) return status;
    return 'wait';
  }

  const cls = $derived(
    [
      'cd-steps',
      `cd-steps--${direction}`,
      `cd-steps--${type}`,
      size !== 'default' && `cd-steps--${size}`,
      isClickable && 'cd-steps--clickable',
      type === 'basic' && hasLine && 'cd-steps--hasline',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function select(index: number) {
    if (!isClickable) return;
    if (index === activeIndex) return;
    if (!isControlled) inner = index;
    onChange?.(index + initial);
  }

  const loc = useLocale();

  // 视觉隐藏的状态文本（WCAG 1.4.1：颜色非唯一信息载体）。
  // 组合「步骤 N，共 M 步，<状态>」供屏幕阅读器朗读。
  function statusText(st: StepStatus): string {
    switch (st) {
      case 'finish':
        return loc().t('Steps.statusFinish');
      case 'process':
        return loc().t('Steps.statusProcess');
      case 'error':
        return loc().t('Steps.statusError');
      case 'warning':
        return loc().t('Steps.statusWarning');
      default:
        return loc().t('Steps.statusWait');
    }
  }
  function srLabel(index: number, st: StepStatus): string {
    // 分隔符 ofTotal 已带（zh「，共 N 步」/ en「 of N」），状态前再以 locale 分隔符停顿。
    const sep = loc().t('Steps.statusSeparator');
    return (
      loc().t('Steps.stepLabel', { index: index + 1 + initial }) +
      loc().t('Steps.ofTotal', { total: steps.length }) +
      sep +
      statusText(st)
    );
  }

  // --- roving tabindex（a11y §6）：可点击步骤组为单一 Tab 停靠点。 ---
  // rootEl 普通引用（bind:this），命令式 focus() 用，非 render 期读 DOM。
  let rootEl = $state<HTMLElement | null>(null);
  // 当前焦点步索引；-1 = 尚无焦点 -> activeIndex（或首步）作为 Tab 停靠点。
  let focusedIndex = $state(-1);

  const focusableIndices = $derived<number[]>(
    isClickable ? steps.map((_, i) => i) : [],
  );

  // 纯派生 tabindex：当前焦点步（或无焦点时回退到 activeIndex/首步）为 0，其余 -1。
  function stepTabindex(index: number): 0 | -1 {
    if (!isClickable) return -1;
    const anchor =
      focusedIndex >= 0
        ? focusedIndex
        : focusableIndices.includes(activeIndex)
          ? activeIndex
          : (focusableIndices[0] ?? -1);
    return index === anchor ? 0 : -1;
  }

  function focusStep(index: number): void {
    focusedIndex = index;
    rootEl?.querySelector<HTMLElement>(`[data-step-index="${index}"]`)?.focus();
  }

  // 步骤 keydown：方向键 roving（纯函数 nextRovingIndex 派生）、Home/End 跳首尾。
  // Enter/Space 交给原生 <button>（触发 onclick → select）。
  function onStepKeydown(e: KeyboardEvent, index: number): void {
    const intent: RovingKey | null = rovingKeyFromEvent(e.key);
    if (!intent) return;
    e.preventDefault();
    const list = focusableIndices;
    if (list.length === 0) return;
    const cur = list.indexOf(index);
    const next = nextRovingIndex(cur, list.length, intent, false);
    const target = list[next];
    if (target != null) focusStep(target);
  }

  // 是否为字符串图标（StepItem.icon 为 string 时直接文本渲染）
  function isStringIcon(icon: StepItem['icon']): icon is string {
    return typeof icon === 'string';
  }

  // 对齐 Semi basicStep renderIcon：仅 wait/process 且无自定义 icon 时渲染圆底序号；
  // finish/error/warning 用形状图标着状态色（无圆底），自定义 icon 同样无圆底着色。
  function hasNumberIcon(step: StepItem, st: StepStatus): boolean {
    return step.icon === undefined && (st === 'wait' || st === 'process');
  }
</script>

{#snippet stepIcon(step: StepItem, index: number, st: StepStatus)}
  {#if hasNumberIcon(step, st)}
    <!-- wait/process：圆底序号 -->
    <span class="cd-steps__icon cd-steps__number-icon" aria-hidden="true">{index + 1 + initial}</span>
  {:else}
    <!-- 形状图标 / 自定义图标：着状态色、无圆底 -->
    <span class="cd-steps__icon cd-steps__glyph" aria-hidden="true">
      {#if step.icon !== undefined}
        {#if isStringIcon(step.icon)}{step.icon}{:else}{@render step.icon()}{/if}
      {:else if st === 'finish'}<IconTickCircle size="inherit" aria-hidden="true" />
      {:else if st === 'error'}<IconAlertCircle size="inherit" aria-hidden="true" />
      {:else if st === 'warning'}<IconAlertTriangle size="inherit" aria-hidden="true" />
      {:else}{index + 1 + initial}{/if}
    </span>
  {/if}
{/snippet}

{#snippet stepBody(step: StepItem, index: number, st: StepStatus)}
  {@render stepIcon(step, index, st)}
  <span class="cd-steps__content">
    <span class="cd-steps__title">{step.title}</span>
    {#if step.description}
      <span class="cd-steps__desc">{step.description}</span>
    {/if}
  </span>
  <!-- WCAG 1.4.1：视觉隐藏的「步骤 N，共 M 步，<状态>」供屏幕阅读器朗读。 -->
  <span class="cd-sr-only">{srLabel(index, st)}</span>
{/snippet}

{#snippet stepsList()}
  <ol class={cls} bind:this={rootEl}>
    {#each steps as step, index (index)}
      {@const st = statusOf(index)}
      {@const last = index === steps.length - 1}
      <li class="cd-steps__item cd-steps__item--{st}" class:cd-steps__item--done={index < activeIndex}>
        {#if isClickable}
          <button
            type="button"
            class="cd-steps__head"
            data-step-index={index}
            aria-label={step.ariaLabel}
            aria-current={index === activeIndex ? 'step' : undefined}
            tabindex={stepTabindex(index)}
            onclick={(e) => {
              step.onClick?.(e);
              select(index);
            }}
            onkeydown={(e) => {
              onStepKeydown(e, index);
              step.onKeyDown?.(e);
            }}
            onfocus={() => {
              focusedIndex = index;
            }}
          >
            {@render stepBody(step, index, st)}
          </button>
        {:else}
          <div
            class="cd-steps__head"
            aria-label={step.ariaLabel}
            aria-current={index === activeIndex ? 'step' : undefined}
          >
            {@render stepBody(step, index, st)}
          </div>
        {/if}
        {#if !last && type === 'basic'}
          <span
            class="cd-steps__line"
            class:cd-steps__line--finish={index < activeIndex}
            aria-hidden="true"
          ></span>
        {/if}
      </li>
    {/each}
  </ol>
{/snippet}

{#if type === 'nav'}
  <nav aria-label={loc().t('Steps.navAriaLabel')}>
    {@render stepsList()}
  </nav>
{:else}
  {@render stepsList()}
{/if}

<style>
  /* 视觉隐藏状态文本（.cd-sr-only）复用 tokens.css 全局工具类，令颜色非唯一信息载体。 */

  .cd-steps {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-steps--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }
  .cd-steps--vertical {
    flex-direction: column;
  }

  .cd-steps__item {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
  }
  .cd-steps--vertical .cd-steps__item {
    flex-direction: column;
    align-items: flex-start;
  }
  .cd-steps__item:last-child {
    flex: none;
  }

  .cd-steps__head {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-steps-basic-item-left-marginright);
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
  }
  .cd-steps--clickable .cd-steps__head {
    cursor: pointer;
  }
  button.cd-steps__head:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  /* 图标节点公共盒：24×24（对齐 Semi height-steps-basic-item-left-number-icon） */
  .cd-steps__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-width-steps-basic-item-left-number-icon);
    block-size: var(--cd-height-steps-basic-item-left-number-icon);
    flex: 0 0 auto;
  }
  /* 圆底序号（仅 wait/process）：圆形背景 + 序号字重 */
  .cd-steps__number-icon {
    border-radius: var(--cd-radius-steps-basic-item-left-number-icon);
    font-weight: var(--cd-font-steps-basic-item-left-number-icon-fontweight);
  }
  /* 形状/自定义图标：无圆底，图标着状态色，放大填满盒（对齐 Semi extra-large 图标） */
  .cd-steps__glyph {
    font-size: var(--cd-width-steps-basic-item-left-number-icon);
    line-height: 1;
  }
  .cd-steps__glyph :global(svg) {
    display: block;
  }

  .cd-steps__content {
    display: inline-flex;
    flex-direction: column;
  }
  .cd-steps__title {
    color: var(--cd-color-steps-main-text-default);
    font-weight: var(--cd-font-steps-basic-item-title-fontweight);
    line-height: var(--cd-font-steps-basic-item-title-lineheight);
  }
  .cd-steps__desc {
    color: var(--cd-color-steps-minor-text-default);
    font-size: var(--cd-font-size-small);
    max-inline-size: var(--cd-width-steps-basic-item-description-maxwidth);
  }

  /* 连接线：默认灰、finish 段高亮 primary */
  .cd-steps__line {
    flex: 1 1 auto;
    background: var(--cd-color-steps-title-after-bg);
  }
  .cd-steps--horizontal .cd-steps__line {
    block-size: var(--cd-height-steps-title-after);
    min-inline-size: var(--cd-spacing-steps-basic-item-left-marginright);
    margin-inline: var(--cd-spacing-steps-basic-item-left-marginright);
  }
  .cd-steps--vertical .cd-steps__line {
    inline-size: var(--cd-width-steps-vertical-icon-after);
    min-block-size: var(--cd-spacing-base);
    margin-inline-start: calc(var(--cd-width-steps-basic-item-left-number-icon) / 2);
  }
  .cd-steps__line--finish {
    background: var(--cd-color-steps-item-done-after-bg);
  }

  /* basic 型隐藏连接线：仅 hasline 时显示 */
  .cd-steps--basic:not(.cd-steps--hasline) .cd-steps__line {
    display: none;
  }

  /* ============ 图标各状态配色（对齐 Semi）============ */
  /* 圆底序号：process=primary 底 + 白字；wait=灰底 + 灰字 */
  .cd-steps--basic .cd-steps__item--process .cd-steps__number-icon,
  .cd-steps--fill .cd-steps__item--process .cd-steps__number-icon {
    background: var(--cd-color-steps-item-left-number-icon-bg);
    color: var(--cd-color-steps-item-process-left-number-icon);
  }
  .cd-steps--basic .cd-steps__item--wait .cd-steps__number-icon,
  .cd-steps--fill .cd-steps__item--wait .cd-steps__number-icon {
    background: var(--cd-color-steps-item-wait-left-number-icon-bg);
    color: var(--cd-color-steps-item-wait-left-number-icon-icon);
  }
  .cd-steps--basic .cd-steps__item--wait .cd-steps__title {
    color: var(--cd-color-steps-item-wait-title-text);
  }
  /* 形状/自定义图标：无底，图标本身着状态色 */
  .cd-steps__item--finish .cd-steps__glyph {
    color: var(--cd-color-steps-item-finish-icon);
  }
  .cd-steps__item--process .cd-steps__glyph {
    color: var(--cd-color-steps-item-process-left-icon);
  }
  .cd-steps__item--wait .cd-steps__glyph {
    color: var(--cd-color-steps-item-wait-left-icon-icon);
  }
  .cd-steps__item--error .cd-steps__glyph {
    color: var(--cd-color-steps-item-error-left-icon);
  }
  .cd-steps__item--warning .cd-steps__glyph {
    color: var(--cd-color-steps-item-warning-left-icon);
  }

  /* clickable 时 wait 态 hover 变色（对齐 Semi wait-hover） */
  .cd-steps--clickable .cd-steps__item--wait button.cd-steps__head:hover .cd-steps__icon {
    background: var(--cd-color-steps-item-wait-left-number-icon-bg-hover);
    color: var(--cd-color-steps-item-wait-left-number-icon-icon-hover);
  }
  .cd-steps--clickable button.cd-steps__head:hover .cd-steps__title {
    color: var(--cd-color-steps-item-title-text-hover);
  }
  .cd-steps--clickable button.cd-steps__head:hover .cd-steps__desc {
    color: var(--cd-color-steps-item-description-text-hover);
  }

  /* basic 迷你尺寸：图标 20px、标题常规字号 */
  .cd-steps--basic.cd-steps--small .cd-steps__icon {
    inline-size: var(--cd-width-steps-basic-small-item-left-number-icon);
    block-size: var(--cd-width-steps-basic-small-item-left-number-icon);
  }

  /* ============ fill 型：整块带边框/圆角/内边距的块状步骤 ============ */
  .cd-steps--fill .cd-steps__item {
    box-sizing: border-box;
    min-block-size: var(--cd-height-steps-item);
    overflow: hidden;
    margin-inline-end: var(--cd-spacing-steps-item-marginright);
    border: var(--cd-width-steps-item-border) solid var(--cd-color-steps-border-default);
    border-radius: var(--cd-radius-steps-item);
    padding: var(--cd-spacing-steps-item-paddingy) var(--cd-spacing-steps-item-paddingx);
  }
  .cd-steps--fill .cd-steps__item:last-child {
    margin-inline-end: 0;
  }
  .cd-steps--fill .cd-steps__head {
    gap: var(--cd-spacing-steps-item-content-marginleft);
  }
  .cd-steps--fill .cd-steps__title {
    font-weight: var(--cd-font-steps-item-title-fontweight);
  }
  /* fill process 态：item 背景高亮 */
  .cd-steps--fill .cd-steps__item--process {
    background: var(--cd-color-steps-process-bg-default);
  }
  /* fill hover/active 态背景（可点击时） */
  .cd-steps--clickable.cd-steps--fill button.cd-steps__head:hover {
    background: var(--cd-color-steps-bg-hover);
  }
  .cd-steps--clickable.cd-steps--fill button.cd-steps__head:active {
    background: var(--cd-color-steps-bg-active);
  }

  /* fill 型旧版配色语义：图标 + 标题同色。
     finish=success 绿、error=danger、warning=warning、process=primary（对齐 fillSteps.scss）。
     图标放大到 header-4 尺寸（约与 24px 圆节点相当）。 */
  .cd-steps--fill .cd-steps__item--finish .cd-steps__glyph,
  .cd-steps--fill .cd-steps__item--finish .cd-steps__title {
    color: var(--cd-color-steps-success-text-default);
  }
  .cd-steps--fill .cd-steps__item--error .cd-steps__glyph,
  .cd-steps--fill .cd-steps__item--error .cd-steps__title {
    color: var(--cd-color-steps-danger-text-default);
  }
  .cd-steps--fill .cd-steps__item--warning .cd-steps__glyph,
  .cd-steps--fill .cd-steps__item--warning .cd-steps__title {
    color: var(--cd-color-steps-warning-text-default);
  }
  .cd-steps--fill .cd-steps__item--process .cd-steps__title {
    color: var(--cd-color-steps-primary-icon-default);
  }
  /* fill hover/active 态文字色（可点击时，对齐 fillSteps.scss 各状态 hover/active）。 */
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--finish button:hover .cd-steps__glyph,
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--finish button:hover .cd-steps__title {
    color: var(--cd-color-steps-success-text-hover);
  }
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--error button:hover .cd-steps__glyph,
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--error button:hover .cd-steps__title {
    color: var(--cd-color-steps-danger-text-hover);
  }
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--warning button:hover .cd-steps__glyph,
  .cd-steps--clickable.cd-steps--fill .cd-steps__item--warning button:hover .cd-steps__title {
    color: var(--cd-color-steps-warning-text-hover);
  }

  /* ============ nav 型：序号 + 标题，内容撑开，不可交互 ============ */
  .cd-steps--nav {
    display: inline-flex;
    flex-flow: row nowrap;
  }
  /* nav 型图标统一灰色（对齐 Semi grey-3），无圆底，不分状态 */
  .cd-steps--nav .cd-steps__icon,
  .cd-steps--nav .cd-steps__glyph {
    background: transparent;
    color: var(--cd-color-steps-nav-item-icon);
    min-inline-size: var(--cd-width-steps-nav-item-icon-minwidth);
    inline-size: auto;
    border-radius: 0;
  }
  .cd-steps--nav .cd-steps__title {
    max-inline-size: var(--cd-width-steps-nav-item-title-maxwidth);
    color: var(--cd-color-steps-nav-item-container-text);
    font-weight: var(--cd-font-steps-nav-item-title-fontweight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-steps--nav .cd-steps__item--process .cd-steps__title {
    color: var(--cd-color-steps-nav-item-title-text-active);
    font-weight: var(--cd-font-steps-nav-item-title-active-fontweight);
  }

  /* nav small 尺寸标题常规字号 */
  .cd-steps--nav.cd-steps--small .cd-steps__title {
    font-size: var(--cd-font-size-small);
  }
</style>
