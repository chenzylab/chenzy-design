<!--
  TypographyBase — shared render core for Title / Text / Paragraph / Numeral.
  严格对齐 Semi Design（semi-ui/typography/base.tsx + semi-foundation/typography/typography.scss）。

  DOM 结构对齐 Semi wrapperDecorations：内容按 mark→code→u→strong→del→a(link) 顺序用真实语义
  标签嵌套包裹（非根元素 class）。根元素类名 cd-typography + 单横线修饰（对齐 Semi semi-typography-*）。

  纯文本路径（无 ellipsis/copyable）：零 hook、零 observer、零 timer，仅 class 拼接 + 语义包裹。
  交互路径组合 @chenzy-design/core 原语（createEllipsis）+ Copyable.svelte（复制按钮，对齐 Semi
  copyable.tsx，含 Tooltip 提示 + live announce）。
    - ellipsis：CSS clamp 默认；expandable/suffix/showTooltip/pos≠end 走 ResizeObserver+rAF 测量。
    - 测量写 state 在 rAF/observer 回调里（异步首测），避免与渲染读形成同步 effect 自循环。
  size='inherit' 经 Svelte context 继承外层 Typography 的实际 size（对齐 Semi SizeContext，见 context.ts）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack, onMount } from 'svelte';
  import { createEllipsis, fitTruncatedText, type EllipsisPos } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';
  import { setParentSize, getParentSize } from './context.js';
  import type {
    TypoType,
    TypoSize,
    EllipsisTooltipOpts,
    EllipsisShowTooltip,
    EllipsisConfig,
    CopyableConfig,
  } from './types.js';
  import Copyable from './Copyable.svelte';

  interface Props {
    /** rendered tag */
    element: string;
    /** 额外根类（cd-typography-text / -paragraph / -title cd-typography-h{n}） */
    extraClass?: string;
    type?: TypoType;
    /** 字号档（Text/Paragraph）。Title 由 heading 决定，不传 size。 */
    size?: TypoSize;
    strong?: boolean;
    /** 字重：Title 传字符串枚举（走 class），Text/Paragraph 传 number（走 style）。 */
    weight?: number | string | undefined;
    /** Title heading（'h1'..'h6'），用于 class 与字重 class 拼接。 */
    heading?: string | undefined;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 段落行距（Paragraph）：normal / extended（对齐 Semi spacing）。 */
    spacing?: 'normal' | 'extended';
    /** 前置图标（对齐 Semi icon）；渲染在内容前，带间距。 */
    icon?: Snippet | undefined;
    /** 链接（对齐 Semi link）：true 或透传给 <a> 的属性对象。 */
    link?: boolean | Record<string, unknown>;
    class?: string;
    /** 自定义内联样式（对齐 Semi base.tsx style）；合并在内部计算样式之后（用户样式优先）。 */
    style?: string | undefined;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    onExpand?: ((expanded: boolean, e: MouseEvent) => void) | undefined;
    /** extra attributes spread onto the host element */
    hostAttrs?: Record<string, unknown> | undefined;
    /** 宿主元素挂载后回传（供 Numeral 遍历文本节点格式化）。 */
    hostRef?: ((el: HTMLElement | undefined) => void) | undefined;
    children?: Snippet | undefined;
  }

  let {
    element,
    extraClass,
    type = 'primary',
    size = 'normal',
    strong = false,
    weight,
    heading,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    spacing = 'normal',
    icon,
    link = false,
    class: className = '',
    style: userStyle = '',
    ellipsis = false,
    copyable = false,
    onExpand,
    hostAttrs,
    hostRef,
    children,
  }: Props = $props();

  const loc = useLocale();

  // --- size='inherit' 继承外层 Typography size（对齐 Semi SizeContext）---
  // 读父级 size；本组件 size=inherit 时用父级，否则用自身。
  // setContext 只能在组件初始化同步阶段调用一次（用初始 size 快照，size 运行时改变的嵌套继承为极少见场景）。
  const parentSize = getParentSize();
  const initSize = untrack(() => size);
  const realSize = $derived<'normal' | 'small'>(size === 'inherit' ? parentSize : size);
  setParentSize(initSize === 'inherit' ? parentSize : initSize);

  // --- weight：Title 字符串枚举走 class；数字走 inline style（对齐 Semi）---
  const isHeader = $derived(Boolean(heading));
  const weightIsNumeric = $derived(weight !== undefined && !isNaN(Number(weight)));
  const inlineWeight = $derived(weightIsNumeric ? `font-weight:${weight};` : '');

  // --- feature flags + normalized configs（纯派生）---
  const ellipsisCfg = $derived.by<EllipsisConfig | null>(() => {
    if (!ellipsis) return null;
    return typeof ellipsis === 'object' ? ellipsis : {};
  });
  const copyableCfg = $derived.by<CopyableConfig | null>(() => {
    if (!copyable) return null;
    return typeof copyable === 'object' ? copyable : {};
  });

  const rows = $derived(ellipsisCfg?.rows ?? 1);
  const expandable = $derived(ellipsisCfg?.expandable ?? false);
  const collapsible = $derived(ellipsisCfg?.collapsible ?? false);
  const pos = $derived(ellipsisCfg?.pos ?? 'end');
  const showTooltip = $derived(Boolean(ellipsisCfg?.showTooltip));
  const tooltipCfg = $derived.by<EllipsisShowTooltip | null>(() => {
    const st = ellipsisCfg?.showTooltip;
    if (!st) return null;
    return st === true ? {} : st;
  });
  const tooltipType = $derived(tooltipCfg?.type ?? 'tooltip');
  const tooltipOpts = $derived(tooltipCfg?.opts ?? {});
  const renderTooltip = $derived(tooltipCfg?.renderTooltip);

  // 纯文本快路径：ellipsis + copyable 全关 → 不实例化任何 core hook / observer。
  const isInteractive = $derived(ellipsisCfg !== null || copyableCfg !== null);

  // 构造期一次性快照（原语 init 实例化一次，不随 config 重建）。
  const initEllipsis = untrack(() => ellipsisCfg);

  // --- ellipsis ---
  let expanded = $state(false);
  let truncated = $state<boolean | null>(null);
  const ellipsisApi = initEllipsis
    ? createEllipsis({
        rows: initEllipsis.rows ?? 1,
        expandable: initEllipsis.expandable ?? false,
        collapsible: initEllipsis.collapsible ?? false,
        pos: initEllipsis.pos ?? 'end',
        onExpand: (e) => {
          expanded = e;
        },
        onChange: (s) => {
          truncated = s.truncated;
        },
      })
    : null;

  // --- DOM refs ---
  let hostEl: HTMLElement | undefined = $state();
  // 宿主挂载/变更后回传（Numeral 用于遍历文本节点格式化）。
  $effect(() => {
    hostRef?.(hostEl);
  });

  function textContent(): string {
    return hostEl?.textContent?.trim() ?? '';
  }

  // --- ellipsis measurement（精确路径: expandable / suffix / showTooltip / pos≠end）---
  const measureRows = initEllipsis?.rows ?? 1;
  const initPos: EllipsisPos = initEllipsis?.pos ?? 'end';
  const needsPreciseTruncate = initEllipsis !== null && initPos !== 'end' && measureRows <= 1;
  const needsMeasure =
    initEllipsis !== null &&
    ((initEllipsis.expandable ?? false) ||
      Boolean(initEllipsis.showTooltip) ||
      initEllipsis.suffix !== undefined ||
      needsPreciseTruncate);
  let truncatedText = $state<string | null>(null);
  let preciseFullText = '';

  let probe: HTMLSpanElement | null = null;
  function measurePreciseNow(): void {
    const el = hostEl;
    if (!el || typeof window === 'undefined') return;
    if (untrack(() => expanded)) {
      if (untrack(() => truncatedText) !== null) truncatedText = null;
      return;
    }
    if (!preciseFullText) preciseFullText = el.textContent?.trim() ?? '';
    const full = preciseFullText;
    if (!full) return;
    const parent = el.parentElement;
    if (!parent) return;
    if (!probe) {
      probe = document.createElement('span');
      const s = probe.style;
      s.position = 'absolute';
      s.visibility = 'hidden';
      s.whiteSpace = 'nowrap';
      s.pointerEvents = 'none';
      s.top = '0';
      s.left = '0';
      probe.setAttribute('aria-hidden', 'true');
      parent.appendChild(probe);
    }
    const cs = window.getComputedStyle(el);
    probe.style.font = cs.font;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.style.fontWeight = cs.fontWeight;
    const containerWidth = el.clientWidth;
    const p = probe;
    const next = fitTruncatedText(full, initPos, (candidate) => {
      p.textContent = candidate;
      return p.scrollWidth <= containerWidth + 1;
    });
    const sliced = next === full ? null : next;
    if (untrack(() => truncatedText) !== sliced) truncatedText = sliced;
  }

  onMount(() => {
    if (!needsMeasure || typeof window === 'undefined' || !ellipsisApi) return;
    const el = hostEl;
    if (!el) return;
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      if (needsPreciseTruncate) {
        measurePreciseNow();
        return;
      }
      ellipsisApi.measure({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        rows: measureRows,
      });
    };
    const schedule = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    // 首次测量也走 rAF：onMount 时机下 flex/grid 子元素的最终宽度可能还没
    // 完成一次真实 layout（同步读 clientWidth 会读到 CSS 声明的初始值，
    // 如 flex:1 搭配的 inline-size:0），导致首屏文字被错误截断为空。
    // ResizeObserver 的首次回调同样异步触发，故不能依赖它兜底这一帧。
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      ro.disconnect();
      probe?.remove();
      probe = null;
    };
  });

  $effect(() => {
    if (!needsPreciseTruncate) return;
    void expanded;
    if (typeof window === 'undefined' || !hostEl) return;
    const frame = window.requestAnimationFrame(measurePreciseNow);
    return () => window.cancelAnimationFrame(frame);
  });

  // --- 展开/折叠切换（对齐 Semi toggleOverflow：onExpand(!expanded, e)）---
  function toggleExpand(e: MouseEvent): void {
    const next = !expanded;
    ellipsisCfg?.onExpand?.(next, e);
    onExpand?.(next, e);
    ellipsisApi?.toggle();
  }

  // 能否走 CSS 截断（对齐 Semi canUseCSSEllipsis：无 expandable/suffix/copyable/pos≠end）
  const canCssEllipsis = $derived(
    ellipsisCfg !== null &&
      !expandable &&
      pos === 'end' &&
      !copyableCfg &&
      !(ellipsisCfg.suffix && ellipsisCfg.suffix.length),
  );

  // --- class（对齐 Semi base.tsx renderContent，单横线）---
  // Semi：type class 仅 !link 时加；size class 用 realSize；link 时加 -link 不加 type。
  const cls = $derived(
    [
      'cd-typography',
      extraClass,
      type && !link && `cd-typography-${type}`,
      !isHeader && `cd-typography-${realSize}`,
      link && 'cd-typography-link',
      disabled && 'cd-typography-disabled',
      spacing === 'extended' && 'cd-typography-extended',
      // Title 字符串字重 → class（对齐 Semi -h{n}-weight-{w}）
      isHeader && weight !== undefined && !weightIsNumeric && `cd-typography-${heading}-weight-${weight}`,
      ellipsisCfg && `cd-typography-ellipsis`,
      ellipsisCfg && rows === 1 && !expanded && `cd-typography-ellipsis-single-line`,
      ellipsisCfg && rows > 1 && !expanded && `cd-typography-ellipsis-multiple-line`,
      ellipsisCfg && rows > 1 && !expanded && element === 'span' && `cd-typography-ellipsis-multiple-line-text`,
      ellipsisCfg && rows === 1 && !expanded && canCssEllipsis && `cd-typography-ellipsis-overflow-ellipsis`,
      ellipsisCfg && rows === 1 && !expanded && canCssEllipsis && element === 'span' && `cd-typography-ellipsis-overflow-ellipsis-text`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // ellipsis 行内样式：多行 CSS clamp。
  const ellipsisStyle = $derived.by(() => {
    if (!ellipsisCfg || expanded) return '';
    if (rows > 1 && canCssEllipsis) return `--cd-typo-clamp:${rows};`;
    return '';
  });
  const userStyleNormalized = $derived(
    userStyle && !userStyle.trim().endsWith(';') ? `${userStyle};` : userStyle,
  );
  const hostStyle = $derived(`${inlineWeight}${ellipsisStyle}${userStyleNormalized}`);

  const isTruncated = $derived(
    needsPreciseTruncate ? truncatedText !== null : truncated === true,
  );
  const tooltipEnabled = $derived(showTooltip && isTruncated && !expanded);
  const fullText = $derived.by(() => {
    void truncated;
    void truncatedText;
    void expanded;
    if (needsPreciseTruncate && truncatedText !== null && !expanded && preciseFullText) {
      return preciseFullText;
    }
    return textContent();
  });
  const tooltipContent = $derived(tooltipOpts.content ?? fullText);

  const expandLabel = $derived(ellipsisCfg?.expandText ?? loc().t('Typography.expand'));
  const collapseLabel = $derived(ellipsisCfg?.collapseText ?? loc().t('Typography.collapse'));

  // link 时透传给 <a> 的属性对象（object 形态）
  const linkAttrs = $derived(typeof link === 'object' ? link : {});

  let linkEl = $state<HTMLAnchorElement | undefined>();
</script>

{#snippet actions()}
  {#if copyableCfg}
    <Copyable config={copyableCfg} getDefaultContent={textContent} />
  {/if}
{/snippet}

<!-- 展开/收起按钮（对齐 Semi renderExpandable，类名 ellipsis-expand；
     Semi 原为 a[role=button] 且自带 TODO 换 span，此处直接用 span 更合 a11y、视觉一致）。 -->
{#snippet expandBtn()}
  {#if (expandable && !expanded && isTruncated) || (collapsible && expanded)}<!--
 --><span
      role="button"
      tabindex="0"
      class="cd-typography-ellipsis-expand"
      aria-label={expanded ? collapseLabel : expandLabel}
      onclick={toggleExpand}
      onkeydown={(e) => {
        if (e.key === 'Enter') toggleExpand(e as unknown as MouseEvent);
      }}
    >{expanded ? collapseLabel : expandLabel}</span>{/if}
{/snippet}

<!-- 内容 + 装饰包裹（对齐 Semi wrapperDecorations：mark→code→u→strong→del→a）。
     link 时内层套 cd-typography-link-text span，underline&&link 时加 -link-underline。 -->
{#snippet inner()}
  {#if icon}<span class="cd-typography-icon">{@render icon()}</span>{/if}{#if needsPreciseTruncate && truncatedText !== null && !expanded}{truncatedText}{:else}{@render children?.()}{/if}{#if ellipsisCfg?.suffix && isTruncated && !expanded}{ellipsisCfg.suffix}{/if}
{/snippet}

{#snippet linkWrapped()}
  {#if link}<span class="cd-typography-link-text {underline ? 'cd-typography-link-underline' : ''}">{@render inner()}</span>{:else}{@render inner()}{/if}
{/snippet}

<!-- 装饰链末端：link 时真正包一层 <a>（对齐 Semi wrapperDecorations wrap(link, disabled?'span':'a')，
     该行包裹的是 content 本身，非宿主元素——宿主始终是 element，见下方 hostNode）。
     disabled 时降级为 span（不可点击但保留视觉/结构）。<a> 自身不带 class（对齐 Semi 空 class），
     颜色继承宿主的 .cd-typography-link 规则，避免外部容器用后代选择器覆盖正文色时连带盖住链接色。 -->
{#snippet linkAnchor()}
  {#if link && !disabled}<a bind:this={linkEl} {...linkAttrs}>{@render linkWrapped()}</a>{:else if link}<span>{@render linkWrapped()}</span>{:else}{@render linkWrapped()}{/if}
{/snippet}

{#snippet decorated()}
  {#if mark}<mark>{@render codeWrap()}</mark>{:else}{@render codeWrap()}{/if}
{/snippet}
{#snippet codeWrap()}
  {#if code}<code>{@render uWrap()}</code>{:else}{@render uWrap()}{/if}
{/snippet}
{#snippet uWrap()}
  {#if underline && !link}<u>{@render strongWrap()}</u>{:else}{@render strongWrap()}{/if}
{/snippet}
{#snippet strongWrap()}
  {#if strong}<strong>{@render delWrap()}</strong>{:else}{@render delWrap()}{/if}
{/snippet}
{#snippet delWrap()}
  {#if del}<del>{@render linkTag()}</del>{:else}{@render linkTag()}{/if}
{/snippet}
{#snippet linkTag()}
  {@render linkAnchor()}
{/snippet}

<!-- 宿主元素（对齐 Semi Typography 容器 = element(component)，恒为传入的 element，
     默认 span；link 时不再变形，<a> 由装饰链 linkAnchor 在内容层单独包裹，
     对齐 Semi Base 组件把 wrap(link,...) 施加在 children 而非容器本身）。 -->
{#snippet hostNode()}
  <svelte:element
    this={element}
    bind:this={hostEl}
    class={cls}
    style={hostStyle || undefined}
    aria-disabled={disabled || undefined}
    {...hostAttrs}
  >{@render decorated()}{@render expandBtn()}{@render actions()}</svelte:element>
{/snippet}

{#if !isInteractive}
  {@render hostNode()}
{:else if showTooltip}
  {#if renderTooltip}
    {@render renderTooltip(fullText, hostNode)}
  {:else if tooltipType === 'popover'}
    <Popover
      content={tooltipEnabled ? tooltipContent : ''}
      title={tooltipOpts.title ?? ''}
      position={tooltipOpts.position ?? 'top'}
      trigger="hover"
      showArrow={tooltipOpts.showArrow ?? true}
      class={tooltipOpts.className ?? ''}
      style={[
        typeof tooltipOpts.maxWidth === 'number'
          ? `max-inline-size:${tooltipOpts.maxWidth}px`
          : tooltipOpts.maxWidth
            ? `max-inline-size:${tooltipOpts.maxWidth}`
            : '',
        tooltipOpts.style ?? '',
      ]
        .filter(Boolean)
        .join(';')}
      disabled={!tooltipEnabled}
      triggerStyle="display:block; inline-size:100%"
    >
      {@render hostNode()}
    </Popover>
  {:else}
    <Tooltip
      content={tooltipEnabled ? tooltipContent : ''}
      position={(tooltipOpts.position ?? tooltipOpts.placement ?? 'top') as never}
      class={tooltipOpts.className ?? ''}
      style={[
        typeof tooltipOpts.maxWidth === 'number'
          ? `max-inline-size:${tooltipOpts.maxWidth}px`
          : tooltipOpts.maxWidth
            ? `max-inline-size:${tooltipOpts.maxWidth}`
            : '',
        tooltipOpts.style ?? '',
      ]
        .filter(Boolean)
        .join(';')}
      disabled={!tooltipEnabled}
      triggerStyle="display:block; inline-size:100%"
    >
      {@render hostNode()}
    </Tooltip>
  {/if}
{:else}
  {@render hostNode()}
{/if}

<style>
  /* ══ 基础排版（对齐 semi-foundation/typography/typography.scss）══
     元素由本组件渲染，子组件 scoped 不生效，统一用 :global。 */
  :global(.cd-typography) {
    color: var(--cd-color-typography-default-text-default);
    font-size: var(--cd-font-size-regular);
    line-height: 20px;
  }

  /* 语义色（对齐 .semi-typography-{type}）。primary 用默认色，不额外覆盖。 */
  :global(.cd-typography-secondary) {
    color: var(--cd-color-typography-secondary-text-default);
  }
  :global(.cd-typography-tertiary) {
    color: var(--cd-color-typography-tertiary-text-default);
  }
  :global(.cd-typography-quaternary) {
    color: var(--cd-color-typography-quaternary-text-default);
  }
  :global(.cd-typography-warning) {
    color: var(--cd-color-typography-warning-text-default);
  }
  :global(.cd-typography-success) {
    color: var(--cd-color-typography-success-text-default);
  }
  :global(.cd-typography-danger) {
    color: var(--cd-color-typography-danger-text-default);
  }

  /* 链接（对齐 .semi-typography.semi-typography-link 复合选择器）。
     复合而非单类：链接常作为 .cd-typography 自身的子孙/自身出现在外部容器
     （如 chat 气泡）里，外部容器常用 `.外层 :global(.cd-typography){color}`
     这类 (0,2,0) 特异性覆盖正文色，若这里仍是单类 (0,1,0) 会被盖成同色，
     链接在深色气泡里看起来「变黑」。 */
  :global(.cd-typography.cd-typography-link) {
    color: var(--cd-color-typography-link-text-default);
    font-weight: var(--cd-font-typography-link-fontweight);
  }
  :global(.cd-typography-disabled) {
    color: var(--cd-color-typography-disabled-text-default);
    cursor: not-allowed;
    user-select: none;
  }
  :global(.cd-typography-disabled.cd-typography-link) {
    color: var(--cd-color-typography-link-text-disabled);
  }
  :global(.cd-typography a) {
    display: inline;
    color: var(--cd-color-typography-link-text-default);
    cursor: pointer;
    text-decoration: none;
  }
  :global(.cd-typography a:visited) {
    color: var(--cd-color-typography-link-text-visited);
  }
  :global(.cd-typography a:hover) {
    color: var(--cd-color-typography-link-text-hover);
  }
  :global(.cd-typography a:active) {
    color: var(--cd-color-typography-link-text-active);
  }
  :global(.cd-typography a .cd-typography-link-underline:hover) {
    border-bottom: var(--cd-width-typography-link-border) solid var(--cd-color-typography-link-text-hover);
    margin-bottom: calc(-1 * var(--cd-width-typography-link-border));
  }
  :global(.cd-typography a .cd-typography-link-underline:active) {
    border-bottom: var(--cd-width-typography-link-border) solid var(--cd-color-typography-link-text-active);
    margin-bottom: calc(-1 * var(--cd-width-typography-link-border));
  }

  /* 前置图标（对齐 .semi-typography-icon）。 */
  :global(.cd-typography-icon) {
    margin-right: var(--cd-spacing-typography-iconprefix-marginright);
    vertical-align: middle;
    color: inherit;
  }
  /* 用户可能直接传入裸 <svg>（无 Icon 基座包裹）：UnoCSS presetUno 的 preflight reset 把
     svg/img/video 等「替换元素」统一设为 display:block（Tailwind Preflight 同源做法），
     裸 svg 因此变成块级、在图标后强制换行，把「图标+文字」拆成两行。Semi 官网无此激进 reset，
     故图标与文字天然同行；这里显式覆盖回 inline，对齐视觉且不影响本身已有 inline-block 的
     Icon 基座（该覆盖只对直接子代 svg 生效，不影响其内部再嵌套的 svg）。 */
  :global(.cd-typography-icon) > :global(svg) {
    display: inline;
  }

  /* 小号文本（对齐 .semi-typography-small）。 */
  :global(.cd-typography-small) {
    font-size: var(--cd-font-size-small);
    line-height: 16px;
    font-weight: var(--cd-font-typography-smalltext-regular-fontweight);
  }
  :global(.cd-typography-small.cd-typography-paragraph) {
    font-weight: var(--cd-font-typography-smallparagraph-regular-fontweight);
  }

  /* 语义标签（对齐 typography.scss code/mark/u/del/strong）。 */
  :global(.cd-typography code) {
    border: var(--cd-width-typography-code-border) solid var(--cd-color-typography-code-border-default);
    border-radius: var(--cd-radius-typography-code);
    color: var(--cd-color-typography-code-text-default);
    background-color: var(--cd-color-typography-code-bg-default);
    padding: 2px 4px;
    font-family: var(--cd-font-family-code);
  }
  :global(.cd-typography mark) {
    background-color: var(--cd-color-typography-mark-bg-default);
  }
  :global(.cd-typography u) {
    text-decoration: underline;
    text-decoration-skip-ink: auto;
  }
  :global(.cd-typography del) {
    text-decoration: line-through;
  }
  :global(.cd-typography strong) {
    font-weight: var(--cd-font-typography-strong-fontweight);
  }

  /* ══ Title（对齐 typography.scss h1..h6 + 字重档）══ */
  :global(.cd-typography-h1) {
    font-size: var(--cd-font-size-header-1);
    line-height: 44px;
    font-weight: var(--cd-font-typography-title1-fontweight);
    margin: var(--cd-spacing-typography-title-h1-margin);
  }
  :global(.cd-typography-h1.cd-typography-h1-weight-light) { font-weight: var(--cd-font-typography-title1-light-fontweight); }
  :global(.cd-typography-h1.cd-typography-h1-weight-regular) { font-weight: var(--cd-font-typography-title1-regular-fontweight); }
  :global(.cd-typography-h1.cd-typography-h1-weight-medium) { font-weight: var(--cd-font-typography-title1-medium-fontweight); }
  :global(.cd-typography-h1.cd-typography-h1-weight-semibold) { font-weight: var(--cd-font-typography-title1-semibold-fontweight); }
  :global(.cd-typography-h1.cd-typography-h1-weight-bold) { font-weight: var(--cd-font-typography-title1-bold-fontweight); }

  :global(.cd-typography-h2) {
    font-size: var(--cd-font-size-header-2);
    line-height: 40px;
    font-weight: var(--cd-font-typography-title2-fontweight);
    margin: var(--cd-spacing-typography-title-h2-margin);
  }
  :global(.cd-typography-h2.cd-typography-h2-weight-light) { font-weight: var(--cd-font-typography-title2-light-fontweight); }
  :global(.cd-typography-h2.cd-typography-h2-weight-regular) { font-weight: var(--cd-font-typography-title2-regular-fontweight); }
  :global(.cd-typography-h2.cd-typography-h2-weight-medium) { font-weight: var(--cd-font-typography-title2-medium-fontweight); }
  :global(.cd-typography-h2.cd-typography-h2-weight-semibold) { font-weight: var(--cd-font-typography-title2-semibold-fontweight); }
  :global(.cd-typography-h2.cd-typography-h2-weight-bold) { font-weight: var(--cd-font-typography-title2-bold-fontweight); }

  :global(.cd-typography-h3) {
    font-size: var(--cd-font-size-header-3);
    line-height: 32px;
    font-weight: var(--cd-font-typography-title3-fontweight);
    margin: var(--cd-spacing-typography-title-h3-margin);
  }
  :global(.cd-typography-h3.cd-typography-h3-weight-light) { font-weight: var(--cd-font-typography-title3-light-fontweight); }
  :global(.cd-typography-h3.cd-typography-h3-weight-regular) { font-weight: var(--cd-font-typography-title3-regular-fontweight); }
  :global(.cd-typography-h3.cd-typography-h3-weight-medium) { font-weight: var(--cd-font-typography-title3-medium-fontweight); }
  :global(.cd-typography-h3.cd-typography-h3-weight-semibold) { font-weight: var(--cd-font-typography-title3-semibold-fontweight); }
  :global(.cd-typography-h3.cd-typography-h3-weight-bold) { font-weight: var(--cd-font-typography-title3-bold-fontweight); }

  :global(.cd-typography-h4) {
    font-size: var(--cd-font-size-header-4);
    line-height: 28px;
    font-weight: var(--cd-font-typography-title4-fontweight);
    margin: var(--cd-spacing-typography-title-h4-margin);
  }
  :global(.cd-typography-h4.cd-typography-h4-weight-light) { font-weight: var(--cd-font-typography-title4-light-fontweight); }
  :global(.cd-typography-h4.cd-typography-h4-weight-regular) { font-weight: var(--cd-font-typography-title4-regular-fontweight); }
  :global(.cd-typography-h4.cd-typography-h4-weight-medium) { font-weight: var(--cd-font-typography-title4-medium-fontweight); }
  :global(.cd-typography-h4.cd-typography-h4-weight-semibold) { font-weight: var(--cd-font-typography-title4-semibold-fontweight); }
  :global(.cd-typography-h4.cd-typography-h4-weight-bold) { font-weight: var(--cd-font-typography-title4-bold-fontweight); }

  :global(.cd-typography-h5) {
    font-size: var(--cd-font-size-header-5);
    line-height: 24px;
    font-weight: var(--cd-font-typography-title5-fontweight);
    margin: var(--cd-spacing-typography-title-h5-margin);
  }
  :global(.cd-typography-h5.cd-typography-h5-weight-light) { font-weight: var(--cd-font-typography-title5-light-fontweight); }
  :global(.cd-typography-h5.cd-typography-h5-weight-regular) { font-weight: var(--cd-font-typography-title5-regular-fontweight); }
  :global(.cd-typography-h5.cd-typography-h5-weight-medium) { font-weight: var(--cd-font-typography-title5-medium-fontweight); }
  :global(.cd-typography-h5.cd-typography-h5-weight-semibold) { font-weight: var(--cd-font-typography-title5-semibold-fontweight); }
  :global(.cd-typography-h5.cd-typography-h5-weight-bold) { font-weight: var(--cd-font-typography-title5-bold-fontweight); }

  :global(.cd-typography-h6) {
    font-size: var(--cd-font-size-header-6);
    line-height: 22px;
    font-weight: var(--cd-font-typography-title6-fontweight);
    margin: var(--cd-spacing-typography-title-h6-margin);
  }
  :global(.cd-typography-h6.cd-typography-h6-weight-light) { font-weight: var(--cd-font-typography-title6-light-fontweight); }
  :global(.cd-typography-h6.cd-typography-h6-weight-regular) { font-weight: var(--cd-font-typography-title6-regular-fontweight); }
  :global(.cd-typography-h6.cd-typography-h6-weight-medium) { font-weight: var(--cd-font-typography-title6-medium-fontweight); }
  :global(.cd-typography-h6.cd-typography-h6-weight-semibold) { font-weight: var(--cd-font-typography-title6-semibold-fontweight); }
  :global(.cd-typography-h6.cd-typography-h6-weight-bold) { font-weight: var(--cd-font-typography-title6-bold-fontweight); }

  /* ══ Paragraph（对齐 typography.scss .semi-typography-paragraph + extended）══ */
  :global(.cd-typography-paragraph) {
    margin: var(--cd-spacing-typography-title-paragraph-margin);
  }
  :global(.cd-typography-paragraph.cd-typography-extended) {
    line-height: var(--cd-font-typography-paragraph-extended-lineheight);
    font-weight: var(--cd-font-typography-normalparagraph-regular-fontweight);
  }

  /* ══ Ellipsis（对齐 typography.scss ellipsis 段）══ */
  :global(.cd-typography-ellipsis-single-line) {
    overflow: hidden;
  }
  :global(.cd-typography-ellipsis-multiple-line) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--cd-typo-clamp, 1);
    line-clamp: var(--cd-typo-clamp, 1);
    overflow: hidden;
  }
  :global(.cd-typography-ellipsis-multiple-line.cd-typography-ellipsis-multiple-line-text) {
    display: -webkit-inline-box;
  }
  :global(.cd-typography-ellipsis-overflow-ellipsis) {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  :global(.cd-typography-ellipsis-overflow-ellipsis.cd-typography-ellipsis-overflow-ellipsis-text) {
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
  }
  /*
    showTooltip 模式下 Text 被 Tooltip/Popover 包裹（Svelte 无 cloneElement，需要真实
    wrapper span 承载事件，Semi/React 没有这层）。Popover 内部也是复用 Tooltip 渲染同一套
    .cd-tooltip/.cd-tooltip-trigger 结构，故只需覆盖一套类名。外层 .cd-tooltip 已用
    triggerStyle 撑满，但 Tooltip 组件未暴露内层 .cd-tooltip-trigger 的等价 prop——它
    默认 inline-block + width:auto（shrink-to-fit），当 Text 依赖 flex:1 分配宽度时
    （如 Upload 文件名）会与外层 flex 容器的宽度传导断开，永久塌陷为 0。
    见 memory: tooltip-trigger-wrapper-shrinks-use-triggerstyle。
    两层包裹的完整覆盖规则见下方 .cd-tooltip:has(...) 复合选择器（外层+内层一起处理）。
  */

  :global(.cd-typography-ellipsis-expand) {
    display: inline;
    margin-left: var(--cd-spacing-typography-expandtext-marginleft);
    color: var(--cd-color-typography-link-text-default);
    cursor: pointer;
  }
  :global(.cd-typography-ellipsis-expand:hover) {
    color: var(--cd-color-typography-link-text-hover);
  }

  /* showTooltip 两层包裹（.cd-tooltip 外层 + .cd-tooltip-trigger 内层）都要作为所在 flex
     容器的普通 flex-item 参与空间分配（flex:1 1 auto + min-inline-size:0），而非固定
     width/max-width:100%——固定 100% 只在该 flex 行只有这一个子项时安全，一旦有兄弟元素
     （如 Tree renderLabel 里 Text 旁边的按钮）就会独占整行宽度，把兄弟挤出可视区域。 */
  :global(.cd-tooltip:has(> .cd-tooltip-trigger > .cd-typography-ellipsis-single-line)),
  :global(.cd-tooltip:has(> .cd-tooltip-trigger > .cd-typography-ellipsis-multiple-line)) {
    display: flex;
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  :global(.cd-tooltip:has(> .cd-tooltip-trigger > .cd-typography-ellipsis-single-line) > .cd-tooltip-trigger),
  :global(.cd-tooltip:has(> .cd-tooltip-trigger > .cd-typography-ellipsis-multiple-line) > .cd-tooltip-trigger) {
    display: flex;
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  /* ══ Copyable（对齐 typography.scss action-copy / action-copied）══ */
  :global(.cd-typography-action-copy) {
    display: inline-flex;
    vertical-align: middle;
    padding: var(--cd-spacing-typography-copyicon-padding);
    margin-left: var(--cd-spacing-typography-copyicon-marginleft);
  }
  :global(.cd-typography-action-copy-icon) {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  :global(.cd-typography-action-copy-icon svg) {
    inline-size: 1em;
    block-size: 1em;
  }
  :global(.cd-typography-action-copy-icon:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: 2px;
  }
  :global(.cd-typography-action-copied) {
    display: inline-flex;
    align-items: center;
    padding: var(--cd-spacing-typography-copyicon-padding);
    margin-left: var(--cd-spacing-typography-copyicon-marginleft);
    vertical-align: middle;
    color: var(--cd-color-typography-copied-text-success);
  }
  :global(.cd-typography-action-copied svg) {
    inline-size: 1em;
    block-size: 1em;
    vertical-align: middle;
    color: var(--cd-color-typography-copied-icon-success);
  }

  /* —— RTL（对齐 Semi typography/rtl.scss）——
     前置图标与复制/已复制按钮的单侧外边距换边。
     ⚠️ `-ellipsis-expand` 只清 margin-left 不补 margin-right ——
     Semi 源码在此处**显式注释掉了** `margin-right: 8px`（原样保留其取舍，不擅自补）。 */
  :global(.cd-rtl) :global(.cd-typography) {
    direction: rtl;
  }
  :global(.cd-rtl) :global(.cd-typography-icon) {
    margin-right: auto;
    margin-left: var(--cd-spacing-typography-iconprefix-marginright);
  }
  :global(.cd-rtl) :global(.cd-typography-ellipsis-expand) {
    margin-left: auto;
  }
  :global(.cd-rtl) :global(.cd-typography-action-copy),
  :global(.cd-rtl) :global(.cd-typography-action-copied) {
    margin-left: auto;
    margin-right: var(--cd-spacing-typography-copyicon-marginleft);
  }
</style>
