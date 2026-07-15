<!--
  TypographyBase — shared render core for Title / Text / Paragraph / Numeral.
  严格对齐 Semi Design（semi-ui/typography/base.tsx + semi-foundation/typography/typography.scss）。

  DOM 结构对齐 Semi wrapperDecorations：内容按 mark→code→u→strong→del→a(link) 顺序用真实语义
  标签嵌套包裹（非根元素 class）。根元素类名 cd-typography + 单横线修饰（对齐 Semi semi-typography-*）。

  纯文本路径（无 ellipsis/copyable）：零 hook、零 observer、零 timer，仅 class 拼接 + 语义包裹。
  交互路径组合 @chenzy-design/core 原语（createEllipsis / createCopyable）。
    - ellipsis：CSS clamp 默认；expandable/suffix/showTooltip/pos≠end 走 ResizeObserver+rAF 测量。
    - 测量写 state 在 rAF/observer 回调里（异步首测），避免与渲染读形成同步 effect 自循环。
  size='inherit' 经 Svelte context 继承外层 Typography 的实际 size（对齐 Semi SizeContext）。
-->
<script lang="ts" module>
  import { getContext, setContext } from 'svelte';

  /** Semi 语义色类型（对齐 strings.TYPE）。 */
  export type TypoType =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'warning'
    | 'danger'
    | 'success';
  /** Semi size（对齐 strings.SIZE）。 */
  export type TypoSize = 'normal' | 'small' | 'inherit';

  const SIZE_CTX = Symbol('cd-typography-size');
  /** 供各子组件把自身实际 size 下传，size='inherit' 时读回。 */
  export function setParentSize(size: 'normal' | 'small'): void {
    setContext(SIZE_CTX, size);
  }
  export function getParentSize(): 'normal' | 'small' {
    return getContext<'normal' | 'small'>(SIZE_CTX) ?? 'normal';
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack, onMount } from 'svelte';
  import {
    createCopyable,
    createEllipsis,
    fitTruncatedText,
    type EllipsisPos,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';

  /**
   * showTooltip 浮层透传选项（对齐 Semi opts）。content 指定浮层显示的自定义内容
   * （非原文）；theme/placement/maxWidth 透传 Tooltip；popover 额外接受 title。
   */
  export interface EllipsisTooltipOpts {
    content?: string;
    title?: string;
    theme?: 'dark' | 'light';
    placement?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    maxWidth?: number | string;
    className?: string;
    style?: string;
  }
  /**
   * showTooltip 配置（对齐 Semi）：
   *  - `true`：默认 Tooltip，浮层 = 完整原文。
   *  - `{ opts: { content } }`：浮层显示自定义内容。
   *  - `{ type: 'popover', opts }`：用 Popover 而非 Tooltip。
   *  - `{ renderTooltip }`：完全自定义浮层。Semi 的 `(content, children) => VNode`
   *    在 Svelte 中表达为 snippet `(fullText, trigger) => 浮层`。
   */
  export interface EllipsisShowTooltip {
    type?: 'tooltip' | 'popover';
    opts?: EllipsisTooltipOpts;
    renderTooltip?: Snippet<[string, Snippet]>;
  }

  export interface EllipsisConfig {
    rows?: number;
    expandable?: boolean;
    /** 展开后是否可折叠回去（Semi collapsible）；默认 false */
    collapsible?: boolean;
    expandText?: string;
    collapseText?: string;
    suffix?: string;
    pos?: EllipsisPos;
    showTooltip?: boolean | EllipsisShowTooltip;
    /** 展开/收起回调（对齐 Semi onExpand(expanded, event)）。 */
    onExpand?: (expanded: boolean, e: MouseEvent) => void;
  }
  /** 复制配置（对齐 Semi CopyableConfig）。 */
  export interface CopyableConfig {
    /** 复制到剪贴板的内容（默认取节点文本）。 */
    content?: string;
    /** 复制图标 tooltip 文案（默认 i18n copy）。 */
    copyTip?: string;
    /** 复制成功提示（默认 i18n copied）。 */
    successTip?: string;
    /** 自定义复制图标（对齐 Semi icon）。 */
    icon?: Snippet;
    /** 复制回调（对齐 Semi onCopy(e, content, res)）。 */
    onCopy?: (e: MouseEvent, content: string, res: boolean) => void;
    /**
     * 完全接管复制控件渲染（对齐 Semi copyable.render）。
     * 参数：copied 是否已复制、doCopy 触发复制、config 当前 CopyableConfig。
     */
    render?: Snippet<[boolean, (e: MouseEvent) => void, CopyableConfig]>;
  }

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
  const initCopyable = untrack(() => copyableCfg);

  // --- copyable ---
  let copied = $state(false);
  const copyApi = initCopyable
    ? createCopyable({
        onChange: (c) => (copied = c),
        onCopy: () => announce(copyableCfg?.successTip ?? loc().t('Typography.copied')),
      })
    : null;
  $effect(() => () => copyApi?.destroy());

  // 复制：core copy() 返回 Promise<boolean>（永不 throw），据其结果回调 onCopy(e, content, res)。
  async function doCopy(e: MouseEvent): Promise<void> {
    if (!copyApi) return;
    const content = copyableCfg?.content ?? textContent();
    const res = await copyApi.copy(content);
    copyableCfg?.onCopy?.(e, content, res);
  }

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

  // --- single live region for copy announce（命令式, cleanup）---
  let liveEl: HTMLDivElement | undefined;
  function ensureLive(): HTMLDivElement | null {
    if (typeof document === 'undefined') return null;
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('role', 'status');
      const s = liveEl.style;
      s.position = 'absolute';
      s.width = '1px';
      s.height = '1px';
      s.margin = '-1px';
      s.padding = '0';
      s.overflow = 'hidden';
      s.clipPath = 'inset(50%)';
      s.whiteSpace = 'nowrap';
      document.body.appendChild(liveEl);
    }
    return liveEl;
  }
  function announce(msg: string): void {
    const el = ensureLive();
    if (!el || !msg) return;
    el.textContent = '';
    el.textContent = msg;
  }
  $effect(() => () => {
    liveEl?.remove();
    liveEl = undefined;
  });

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
    measure();
    const schedule = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
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

  const copyLabel = $derived(copyableCfg?.copyTip ?? loc().t('Typography.copy'));
  const expandLabel = $derived(ellipsisCfg?.expandText ?? loc().t('Typography.expand'));
  const collapseLabel = $derived(ellipsisCfg?.collapseText ?? loc().t('Typography.collapse'));

  // link 时透传给 <a> 的属性对象（object 形态）
  const linkAttrs = $derived(typeof link === 'object' ? link : {});
</script>

{#snippet copyIconDefault()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke-linecap="round" />
  </svg>
{/snippet}
{#snippet copiedIconDefault()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet actions()}
  {#if copyableCfg}
    {#if copyableCfg.render}
      {@render copyableCfg.render(copied, doCopy, copyableCfg)}
    {:else if copied}
      <span class="cd-typography-action-copied">
        {#if copyableCfg.successTip}{copyableCfg.successTip}{:else}{@render copiedIconDefault()}{loc().t('Typography.copied')}{/if}
      </span>
    {:else}
      <span class="cd-typography-action-copy">
        <button
          type="button"
          class="cd-typography-action-copy-icon"
          aria-label={copyLabel}
          title={copyLabel}
          onclick={doCopy}
        >
          {#if copyableCfg.icon}{@render copyableCfg.icon()}{:else}{@render copyIconDefault()}{/if}
        </button>
      </span>
    {/if}
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
  {#if link && disabled}<span>{@render linkWrapped()}</span>{:else if link}<a {...linkAttrs}>{@render linkWrapped()}</a>{:else}{@render linkWrapped()}{/if}
{/snippet}

<!-- 宿主元素（对齐 Semi Typography 容器 = element(component)）。 -->
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
      disabled={!tooltipEnabled}
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

  /* 链接（对齐 .semi-typography-link + a）。 */
  :global(.cd-typography-link) {
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
  :global(.cd-typography-ellipsis-expand) {
    display: inline;
    margin-left: var(--cd-spacing-typography-expandtext-marginleft);
    color: var(--cd-color-typography-link-text-default);
    cursor: pointer;
  }
  :global(.cd-typography-ellipsis-expand:hover) {
    color: var(--cd-color-typography-link-text-hover);
  }

  /* showTooltip 包裹撑满父宽，使宽度约束正确传递到宿主省略节点。 */
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography-ellipsis-single-line)),
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography-ellipsis-multiple-line)) {
    display: block;
    max-inline-size: 100%;
  }
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography-ellipsis-single-line) > .cd-tooltip__trigger),
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography-ellipsis-multiple-line) > .cd-tooltip__trigger) {
    display: block;
    max-inline-size: 100%;
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
</style>
