<!--
  TypographyBase — shared render core for Title / Text / Paragraph / Link.
  See specs/components/basic/Typography.spec.md §3 (分层), §4, §6, §12.

  纯文本路径（无 ellipsis/copyable/editable）：零 hook、零 observer、零 timer，仅 class 拼接，
  与旧行为完全一致（向后兼容，红线：不传三 prop 行为不变）。

  交互路径组合 @chenzy-design/core 三原语（createEllipsis/createCopyable/createEditable）。
  - 受控编辑 value + onChange，组件内不回写（红线 #1）。
  - 剪贴板 / 编辑 textarea / ellipsis 测量(ResizeObserver+rAF) 命令式 + cleanup（红线 #3）。
  - 省略/复制态/编辑态派生纯函数，core 持纯逻辑（红线 #2）。
  - 测量写 state 在 rAF/observer 回调里（异步首测），避免与渲染读形成同步 effect 自循环。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack, onMount } from 'svelte';
  import {
    useId,
    createCopyable,
    createEditable,
    createEllipsis,
    computeAutosizeHeight,
    type EllipsisPos,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'success';
  type TypoWeight = number | 'regular' | 'medium' | 'semibold' | 'bold';
  type TypoSize = 'small' | 'default' | 'large';

  /**
   * showTooltip 浮层透传选项（对齐 Semi opts）。content 指定浮层显示的自定义内容
   * （非原文）；theme/placement/maxWidth 透传 Tooltip；popover 额外接受 title。
   */
  export interface EllipsisTooltipOpts {
    /** 浮层显示的内容；缺省用完整原文（fullText） */
    content?: string;
    /** Popover 模式标题 */
    title?: string;
    theme?: 'dark' | 'light';
    placement?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    maxWidth?: number | string;
  }
  /**
   * showTooltip 配置（对齐 Semi）：
   *  - `true`：默认 Tooltip，浮层 = 完整原文。
   *  - `{ opts: { content } }`：浮层显示自定义内容。
   *  - `{ type: 'popover', opts }`：用 Popover 而非 Tooltip。
   *  - `{ renderTooltip }`：完全自定义浮层。Semi 的 `(content, children) => VNode`
   *    在 Svelte 中表达为 snippet `(fullText, trigger) => 浮层`，其中 trigger 是
   *    渲染好的截断文本（须作为浮层触发器渲染出来），fullText 为完整原文。
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
    onExpand?: (expanded: boolean) => void;
  }
  export interface CopyableConfig {
    content?: string;
    successText?: string;
    icon?: Snippet;
    successIcon?: Snippet;
  }
  export interface EditableConfig {
    editing?: boolean;
    trigger?: 'click' | 'dblclick' | 'icon';
    maxLength?: number;
    autosize?: boolean;
  }

  interface Props {
    /** rendered tag */
    element: string;
    baseClass: string;
    extraClass?: string;
    type?: TypoType;
    /** 字号档（Text/Paragraph）。Title 由 heading 决定，不传 size。spec §4.1 L60 */
    size?: TypoSize;
    strong?: boolean;
    weight?: TypoWeight | undefined;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    class?: string;
    /** ellipsis / copyable / editable */
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    editable?: boolean | EditableConfig;
    /** controlled text value (editable). undefined → uncontrolled-ish: read from DOM/children */
    value?: string | undefined;
    onChange?: ((value: string) => void) | undefined;
    onCopy?: ((content: string) => void) | undefined;
    onEditStart?: (() => void) | undefined;
    onEditCancel?: (() => void) | undefined;
    onExpand?: ((expanded: boolean) => void) | undefined;
    /** extra attributes spread onto the host element (href/target/rel for Link) */
    hostAttrs?: Record<string, unknown> | undefined;
    children?: Snippet | undefined;
  }

  let {
    element,
    baseClass,
    extraClass,
    type = 'default',
    size = 'default',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    class: className = '',
    ellipsis = false,
    copyable = false,
    editable = false,
    value,
    onChange,
    onCopy,
    onEditStart,
    onEditCancel,
    onExpand,
    hostAttrs,
    children,
  }: Props = $props();

  const loc = useLocale();
  const baseId = useId('cd-typography');

  const weightMap: Record<string, string> = {
    regular: 'var(--cd-font-weight-regular)',
    medium: 'var(--cd-font-weight-medium)',
    semibold: 'var(--cd-font-weight-semibold)',
    bold: '700',
  };
  const resolvedWeight = $derived.by(() => {
    if (weight === undefined) return undefined;
    return typeof weight === 'number' ? String(weight) : weightMap[weight];
  });
  const inlineWeight = $derived(resolvedWeight ? `font-weight:${resolvedWeight};` : '');

  // --- feature flags + normalized configs (纯派生, 红线 #2) ---
  const ellipsisCfg = $derived.by<EllipsisConfig | null>(() => {
    if (!ellipsis) return null;
    return typeof ellipsis === 'object' ? ellipsis : {};
  });
  const copyableCfg = $derived.by<CopyableConfig | null>(() => {
    if (!copyable) return null;
    return typeof copyable === 'object' ? copyable : {};
  });
  const editableCfg = $derived.by<EditableConfig | null>(() => {
    if (!editable) return null;
    return typeof editable === 'object' ? editable : {};
  });

  const rows = $derived(ellipsisCfg?.rows ?? 1);
  const expandable = $derived(ellipsisCfg?.expandable ?? false);
  const collapsible = $derived(ellipsisCfg?.collapsible ?? false);
  const pos = $derived(ellipsisCfg?.pos ?? 'end');
  const showTooltip = $derived(Boolean(ellipsisCfg?.showTooltip));
  // 归一化 showTooltip 配置（对齐 Semi：true → 默认 tooltip）。
  const tooltipCfg = $derived.by<EllipsisShowTooltip | null>(() => {
    const st = ellipsisCfg?.showTooltip;
    if (!st) return null;
    return st === true ? {} : st;
  });
  const tooltipType = $derived(tooltipCfg?.type ?? 'tooltip');
  const tooltipOpts = $derived(tooltipCfg?.opts ?? {});
  const renderTooltip = $derived(tooltipCfg?.renderTooltip);

  // 纯文本快路径：三特性全关 → 不实例化任何 core hook / observer / timer。
  const isInteractive = $derived(
    ellipsisCfg !== null || copyableCfg !== null || editableCfg !== null,
  );

  // 构造期一次性快照（untrack：原语在 init 实例化一次，不随 config 重建；
  // 渲染仍读 $derived 版本保持响应）。避免 state_referenced_locally 警告。
  const initEllipsis = untrack(() => ellipsisCfg);
  const initCopyable = untrack(() => copyableCfg);
  const initEditable = untrack(() => editableCfg);

  // --- core primitives (lazily constructed only when interactive) ---
  // copyable
  let copied = $state(false);
  const copyApi = initCopyable
    ? createCopyable({
        onChange: (c) => (copied = c),
        onCopy: (content) => {
          announce(loc().t('Typography.copied'));
          onCopy?.(content);
        },
        onError: () => announce(loc().t('Typography.copyFailed')),
      })
    : null;
  $effect(() => () => copyApi?.destroy());

  async function doCopy(): Promise<void> {
    if (!copyApi) return;
    const content = copyableCfg?.content ?? value ?? textContent();
    await copyApi.copy(content);
  }

  // ellipsis
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
          ellipsisCfg?.onExpand?.(e);
          onExpand?.(e);
        },
        onChange: (s) => {
          truncated = s.truncated;
        },
      })
    : null;

  // editable — controlled value + onChange (红线 #1: 不回写)
  let editing = $state(false);
  let draft = $state('');
  const editApi = initEditable
    ? createEditable({
        get value() {
          return value ?? textContent();
        },
        ...(initEditable.maxLength !== undefined ? { maxLength: initEditable.maxLength } : {}),
        ...(initEditable.trigger !== undefined ? { trigger: initEditable.trigger } : {}),
        onChange: (s) => {
          editing = s.editing;
          draft = s.draft;
        },
        onCommit: (v) => onChange?.(v),
        onStart: () => onEditStart?.(),
        onCancel: () => onEditCancel?.(),
      })
    : null;

  // 受控 editing: 父传 editableCfg.editing 时与内部状态同步（命令式驱动 start/cancel）。
  $effect(() => {
    if (!editApi || editableCfg?.editing === undefined) return;
    const want = editableCfg.editing;
    untrack(() => {
      if (want && !editApi.editing) editApi.start();
      else if (!want && editApi.editing) editApi.cancel();
    });
  });

  // --- DOM refs ---
  let hostEl: HTMLElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let lastTrigger: HTMLElement | null = null;

  function textContent(): string {
    return hostEl?.textContent?.trim() ?? '';
  }

  // --- single live region for copy/announce (命令式, cleanup) ---
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

  // --- ellipsis measurement (精确路径: expandable / suffix / showTooltip) ---
  // CSS clamp 为默认；仅当需要 truncated 判定时才挂 ResizeObserver。
  // needsMeasure 为构造期常量（基于 untrack 快照），保证测量 effect 只随 hostEl 建立/销毁一次，
  // 不被 ellipsisCfg 等派生的重算反复 re-run（否则会反复 cancel rAF，测量永不落地）。
  const measureRows = initEllipsis?.rows ?? 1;
  const needsMeasure =
    initEllipsis !== null &&
    ((initEllipsis.expandable ?? false) ||
      Boolean(initEllipsis.showTooltip) ||
      initEllipsis.suffix !== undefined);

  // onMount 一次性建立 ResizeObserver + rAF 测量，卸载时清理。
  // 用 onMount 而非 $effect(hostEl) —— 避免 host 因模板派生重渲染导致 effect 反复 teardown，
  // 把 pending rAF cancel 掉（测量永不落地）的坑（svelte:element 不支持 use: 动作）。
  // 命令式 + cleanup（红线 #3）；rAF 首测异步避免与渲染读写同栈（红线 #4）。
  onMount(() => {
    if (!needsMeasure || typeof window === 'undefined' || !ellipsisApi) return;
    const el = hostEl;
    if (!el) return;
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      // 展开态 clamp 已撤除, scrollHeight==clientHeight, 不会误判
      ellipsisApi.measure({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        rows: measureRows,
      });
    };
    // 首测：DOM 已布局，直接同步测一次落定 truncated（写 state 在 onMount 内，渲染读分离，无自循环）。
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
    };
  });

  // --- editable: 进入编辑聚焦 textarea；退出后焦点归还触发器（命令式, 红线 #3） ---
  $effect(() => {
    if (!editApi) return;
    if (editing) {
      const ta = textareaEl;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
        applyAutosize();
      }
    } else if (lastTrigger) {
      const t = lastTrigger;
      lastTrigger = null;
      t.focus?.();
    }
  });

  function applyAutosize(): void {
    const ta = textareaEl;
    if (!ta || editableCfg?.autosize === false) return;
    ta.style.height = 'auto';
    const cs = window.getComputedStyle(ta);
    const lineHeight = parseFloat(cs.lineHeight) || 20;
    const vPad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const vBorder = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const { height } = computeAutosizeHeight({
      scrollHeight: ta.scrollHeight,
      lineHeight,
      verticalPadding: vPad,
      verticalBorder: vBorder,
      minRows: 1,
      maxRows: 6,
    });
    ta.style.height = `${height}px`;
  }

  function startEdit(e: Event): void {
    if (disabled || !editApi) return;
    lastTrigger = (e.currentTarget as HTMLElement) ?? null;
    editApi.start();
  }
  function onTriggerHost(e: Event): void {
    if (!editApi) return;
    const trig = editableCfg?.trigger ?? 'icon';
    if (trig === 'click' && e.type === 'click') startEdit(e);
    else if (trig === 'dblclick' && e.type === 'dblclick') startEdit(e);
  }
  // 合并 hostAttrs.onclick (如 Link 的 handleClick) 与编辑 click 触发
  function hostClick(e: MouseEvent): void {
    (hostAttrs?.onclick as ((ev: MouseEvent) => void) | undefined)?.(e);
    onTriggerHost(e);
  }
  function onTextareaInput(e: Event): void {
    editApi?.setDraft((e.target as HTMLTextAreaElement).value);
    applyAutosize();
  }
  function onTextareaKeydown(e: KeyboardEvent): void {
    if (!editApi) return;
    const action = editApi.handleKey({ key: e.key, shiftKey: e.shiftKey });
    if (action === 'confirm' || action === 'cancel') e.preventDefault();
  }

  // --- class (与旧实现一致 + 交互修饰) ---
  const cls = $derived(
    [
      baseClass,
      extraClass,
      type !== 'default' && `${baseClass}--${type}`,
      // 字号档：Title (extraClass 含 --title) 由 heading 决定, 忽略 size (spec §4.1 L60)
      size !== 'default' && !extraClass?.includes(`${baseClass}--title`) && `${baseClass}--size-${size}`,
      strong && `${baseClass}--strong`,
      disabled && `${baseClass}--disabled`,
      mark && `${baseClass}--mark`,
      underline && `${baseClass}--underline`,
      del && `${baseClass}--delete`,
      code && `${baseClass}--code`,
      ellipsisCfg && !expanded && `${baseClass}--ellipsis`,
      ellipsisCfg && rows > 1 && !expanded && `${baseClass}--ellipsis-multi`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // ellipsis 行内样式: 多行用 line-clamp; 单行用 text-overflow.
  const ellipsisStyle = $derived.by(() => {
    if (!ellipsisCfg || expanded) return '';
    if (rows > 1) return `--cd-typo-clamp:${rows};`;
    return '';
  });
  const hostStyle = $derived(`${inlineWeight}${ellipsisStyle}`);

  // tooltip: 仅在确实溢出且 showTooltip 时启用
  const tooltipEnabled = $derived(showTooltip && truncated === true && !expanded);
  // textContent() 非响应式：用 truncated/expanded 变化作为重算触发器（measure 写 state 后重新取 DOM 全文）。
  const fullText = $derived.by(() => {
    void truncated;
    void expanded;
    return textContent();
  });
  // 浮层显示内容：opts.content 自定义优先，否则用完整原文。
  const tooltipContent = $derived(tooltipOpts.content ?? fullText);

  const copyLabel = $derived(loc().t('Typography.copy'));
  const editLabel = $derived(loc().t('Typography.edit'));
  const expandLabel = $derived(ellipsisCfg?.expandText ?? loc().t('Typography.expand'));
  const collapseLabel = $derived(ellipsisCfg?.collapseText ?? loc().t('Typography.collapse'));
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
{#snippet editIconDefault()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M4 20h4l10-10-4-4L4 16v4z" stroke-linejoin="round" />
    <path d="M13.5 6.5l4 4" stroke-linecap="round" />
  </svg>
{/snippet}

{#snippet actions()}
  {#if copyableCfg}
    <button
      type="button"
      class="{baseClass}__action {baseClass}__action--copy"
      class:is-copied={copied}
      aria-label={copyLabel}
      title={copyLabel}
      onclick={doCopy}
    >
      {#if copied}
        {#if copyableCfg.successIcon}{@render copyableCfg.successIcon()}{:else}{@render copiedIconDefault()}{/if}
      {:else if copyableCfg.icon}{@render copyableCfg.icon()}{:else}{@render copyIconDefault()}{/if}
    </button>
  {/if}
  {#if editableCfg && (editableCfg.trigger ?? 'icon') === 'icon'}
    <button
      type="button"
      class="{baseClass}__action {baseClass}__action--edit"
      aria-label={editLabel}
      title={editLabel}
      onclick={startEdit}
    >
      {@render editIconDefault()}
    </button>
  {/if}
{/snippet}

{#if editApi && editing}
  <!-- inline edit mode: textarea 替换文本 -->
  <span class="{baseClass}__edit-wrap">
    <textarea
      bind:this={textareaEl}
      class="{baseClass}__edit-input"
      value={draft}
      maxlength={editableCfg?.maxLength}
      aria-label={editLabel}
      rows="1"
      oninput={onTextareaInput}
      onkeydown={onTextareaKeydown}
      onblur={() => editApi?.confirm()}
    ></textarea>
  </span>
{:else if !isInteractive}
  <!-- 纯文本快路径: 与旧实现完全一致 (向后兼容) -->
  <svelte:element this={element} class={cls} style={hostStyle || undefined} aria-disabled={disabled || undefined} {...hostAttrs}>
    {@render children?.()}
  </svelte:element>
{:else}
  <!-- showTooltip: 把截断后的文本宿主（hostNode，触发器）用 Tooltip/Popover 包裹，
       浮层 content = 完整原文 / 自定义内容（Semi renderTipWrapper 模式）。
       注意：以 showTooltip（静态配置）而非 tooltipEnabled（随 truncated 变化）决定是否包裹，
       使 hostNode 在浮层内位置稳定，避免 truncated 翻转时 host 被 {#if} 销毁重建、
       导致 onMount 建立的 ResizeObserver 观察到失效节点（测量永不再落地）。
       未溢出/展开时用浮层 disabled / 空内容关闭浮层，不渲染浮层。 -->
  {#if showTooltip}
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
        placement={(tooltipOpts.placement ?? 'top') as never}
        theme={tooltipOpts.theme ?? 'dark'}
        maxWidth={tooltipOpts.maxWidth ?? 300}
        disabled={!tooltipEnabled}
      >
        {@render hostNode()}
      </Tooltip>
    {/if}
  {:else}
    {@render hostNode()}
  {/if}

  {#if (expandable && !expanded && truncated === true) || (collapsible && expanded)}
    <button
      type="button"
      class="{baseClass}__expand"
      aria-expanded={expanded}
      onclick={() => ellipsisApi?.toggle()}
    >
      {expanded ? collapseLabel : expandLabel}
    </button>
  {/if}

  {@render actions()}
{/if}

{#snippet hostNode()}
  <svelte:element
    this={element}
    bind:this={hostEl}
    class={cls}
    style={hostStyle || undefined}
    aria-disabled={disabled || undefined}
    {...hostAttrs}
    onclick={hostClick}
    ondblclick={onTriggerHost}
  >
    {@render children?.()}{#if ellipsisCfg?.suffix && truncated === true && !expanded}<!--
 -->{ellipsisCfg.suffix}{/if}
  </svelte:element>
{/snippet}

<style>
  /* ── 基础排版样式 (统一源, 因实际元素由本组件渲染, 子组件 scoped 不生效) ── */
  :global(.cd-typography) {
    color: var(--cd-typography-color);
  }
  :global(.cd-typography--paragraph),
  :global(.cd-typography--title) {
    margin: 0;
  }
  :global(.cd-typography--paragraph) {
    margin-block-end: var(--cd-spacing-4);
  }
  :global(.cd-typography--title) {
    font-weight: var(--cd-font-weight-semibold);
  }
  :global(.cd-typography--h1) {
    font-size: var(--cd-font-size-6);
  }
  :global(.cd-typography--h2) {
    font-size: var(--cd-font-size-5);
  }
  :global(.cd-typography--h3) {
    font-size: var(--cd-font-size-4);
  }
  :global(.cd-typography--h4) {
    font-size: var(--cd-font-size-3);
  }
  :global(.cd-typography--h5) {
    font-size: var(--cd-font-size-2);
  }
  :global(.cd-typography--h6) {
    font-size: var(--cd-font-size-1);
  }
  :global(.cd-typography--link) {
    color: var(--cd-typography-color-link);
    text-decoration: none;
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  :global(.cd-typography--link:hover) {
    color: var(--cd-typography-color-link-hover);
  }
  :global(.cd-typography--link:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: 2px;
  }
  :global(.cd-typography--link.cd-typography--disabled) {
    pointer-events: none;
  }
  :global(.cd-typography--secondary) {
    color: var(--cd-typography-color-secondary);
  }
  :global(.cd-typography--tertiary) {
    color: var(--cd-typography-color-tertiary);
  }
  :global(.cd-typography--warning) {
    color: var(--cd-color-warning);
  }
  :global(.cd-typography--danger) {
    color: var(--cd-color-danger);
  }
  :global(.cd-typography--success) {
    color: var(--cd-color-success);
  }
  :global(.cd-typography--strong) {
    font-weight: var(--cd-font-weight-semibold);
  }
  /* 字号档 (Text/Paragraph) — spec §4.1 size + §5 token 表; default 沿用继承字号保持向后兼容 */
  :global(.cd-typography--size-small) {
    font-size: var(--cd-typography-font-size-small, var(--cd-font-size-1));
  }
  :global(.cd-typography--size-large) {
    font-size: var(--cd-typography-font-size-large, var(--cd-font-size-3));
  }
  :global(.cd-typography--disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :global(.cd-typography--mark) {
    background-color: var(--cd-typography-mark-bg);
  }
  :global(.cd-typography--underline) {
    text-decoration-line: underline;
  }
  /* 链接 + underline 变体：平时无下划线，hover 才出（对齐 Semi，仅作用于 link）。
     非链接的 underline 文本仍常显下划线。 */
  :global(.cd-typography--link.cd-typography--underline) {
    text-decoration-line: none;
  }
  :global(.cd-typography--link.cd-typography--underline:hover) {
    text-decoration-line: underline;
  }
  :global(.cd-typography--delete) {
    text-decoration-line: line-through;
  }
  :global(.cd-typography--underline.cd-typography--delete) {
    text-decoration-line: underline line-through;
  }
  :global(.cd-typography--code) {
    font-family: var(--cd-font-family-mono, monospace);
    font-size: var(--cd-typography-code-font-size);
    background-color: var(--cd-typography-code-bg);
    padding-inline: 0.4em;
    padding-block: 0.1em;
    border-radius: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.cd-typography--link) {
      transition: none;
    }
  }

  /* ── 交互态样式 ── */
  :global(.cd-typography--ellipsis) {
    /* Text 渲染为 <span>（display:inline）；text-overflow/overflow 在 inline 上不生效，
       需 inline-block 才能截断。max-inline-size 令其受父容器宽度约束，
       vertical-align 避免 inline-block 基线下沉。 */
    display: inline-block;
    max-inline-size: 100%;
    vertical-align: bottom;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  :global(.cd-typography--ellipsis-multi) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--cd-typo-clamp, 1);
    line-clamp: var(--cd-typo-clamp, 1);
    white-space: normal;
    overflow: hidden;
  }
  /* showTooltip：Tooltip/Popover 触发包裹默认 inline-block 收缩到内容宽，
     会让被包裹宿主的 max-inline-size:100% 退化为内容宽（永不溢出、tooltip 永不触发）。
     当包裹的是省略宿主时，让包裹层撑满父容器宽度，使宽度约束正确传递到宿主。 */
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis)),
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis-multi)),
  :global(.cd-popover:has(> .cd-popover__trigger > .cd-typography--ellipsis)),
  :global(.cd-popover:has(> .cd-popover__trigger > .cd-typography--ellipsis-multi)) {
    display: block;
    max-inline-size: 100%;
  }
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis) > .cd-tooltip__trigger),
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis-multi) > .cd-tooltip__trigger),
  :global(.cd-popover:has(> .cd-popover__trigger > .cd-typography--ellipsis) > .cd-popover__trigger),
  :global(.cd-popover:has(> .cd-popover__trigger > .cd-typography--ellipsis-multi) > .cd-popover__trigger) {
    display: block;
    max-inline-size: 100%;
  }
  :global(.cd-typography__action) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: 4px;
    padding: 2px;
    border: 0;
    background: transparent;
    color: var(--cd-typography-action-color, var(--cd-color-text-2));
    cursor: pointer;
    border-radius: 3px;
    vertical-align: middle;
    transition: color var(--cd-motion-duration-fast, 120ms) ease;
  }
  :global(.cd-typography__action:hover) {
    color: var(--cd-typography-action-color-hover, var(--cd-color-primary));
  }
  :global(.cd-typography__action:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  :global(.cd-typography__action--copy.is-copied) {
    color: var(--cd-color-success);
  }
  :global(.cd-typography__expand) {
    margin-inline-start: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--cd-color-link, var(--cd-color-primary));
    cursor: pointer;
    font: inherit;
  }
  :global(.cd-typography__expand:hover) {
    color: var(--cd-color-link-hover, var(--cd-color-primary));
  }
  :global(.cd-typography__expand:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: 2px;
  }
  :global(.cd-typography__edit-wrap) {
    display: inline-block;
    width: 100%;
  }
  :global(.cd-typography__edit-input) {
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    color: inherit;
    padding: 2px 6px;
    border: 1px solid var(--cd-color-border, #d9d9d9);
    border-radius: var(--cd-border-radius, 4px);
    background: var(--cd-color-bg-1, #fff);
    resize: none;
    overflow: hidden;
  }
  :global(.cd-typography__edit-input:focus-visible) {
    outline: none;
    border-color: var(--cd-color-primary);
    box-shadow: var(--cd-focus-ring);
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.cd-typography__action) {
      transition: none;
    }
  }
</style>
