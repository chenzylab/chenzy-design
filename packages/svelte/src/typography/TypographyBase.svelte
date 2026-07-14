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
    fitTruncatedText,
    type EllipsisPos,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'quaternary' | 'warning' | 'danger' | 'success';
  type TypoWeight = number | 'regular' | 'medium' | 'semibold' | 'bold';
  type TypoSize = 'small' | 'default' | 'large' | 'inherit';

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
    /** 浮层自定义类名（对齐 Semi opts.className）。 */
    className?: string;
    /** 浮层自定义内联样式（对齐 Semi opts.style）。 */
    style?: string;
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
    /**
     * 完全接管复制控件渲染（对齐 Semi `copyable.render`）。
     * 参数：`copied` 当前是否已复制、`doCopy` 触发复制、`config` 当前 CopyableConfig。
     * 提供后 icon/successIcon 及内置 button 均不渲染，由使用方自绘。
     */
    render?: Snippet<[boolean, () => void, CopyableConfig]>;
  }
  export interface EditableConfig {
    editing?: boolean;
    /**
     * 进入编辑方式（对齐 Ant）：
     *  - `'icon'`（默认）：仅点铅笔图标，宿主不响应；
     *  - `'click'` / `'dblclick'`：点/双击宿主进入（不显示铅笔图标）；
     *  - `'text'`：点文本进入（不显示铅笔图标）；
     *  - `'both'`：文本与铅笔图标都能进入（图标仍显示）。
     */
    trigger?: 'click' | 'dblclick' | 'icon' | 'text' | 'both';
    maxLength?: number;
    autosize?: boolean;
    /** 自定义编辑触发图标（替换默认铅笔）。对齐 Ant editIcon。 */
    editIcon?: Snippet;
    /**
     * 编辑触发图标的 tooltip 文案（title）；`false` 隐藏 title，
     * 缺省用 i18n 的 `Typography.edit`。aria-label 始终保留（隐藏 tooltip 不丢 a11y）。
     */
    tooltip?: string | false;
    /**
     * 编辑框右下角「回车确认」提示图标（对齐 Ant enterIcon）；点击 = 确认提交。
     * `false` 隐藏；缺省用内置回车箭头图标。
     */
    enterIcon?: Snippet | false;
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
    /** 斜体（对齐 Semi italic）。 */
    italic?: boolean;
    /** 前置图标（对齐 Semi icon）；渲染在内容前，带间距。 */
    icon?: Snippet | undefined;
    /** 段落行距（Paragraph）：normal / extended（对齐 Semi spacing）。 */
    spacing?: 'normal' | 'extended';
    class?: string;
    /** 自定义内联样式（对齐 Semi base.tsx style）；合并在内部计算样式之后（用户样式优先）。 */
    style?: string | undefined;
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
    italic = false,
    icon,
    spacing = 'normal',
    class: className = '',
    style: userStyle = '',
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
    semibold: 'var(--cd-font-weight-bold)',
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
  // 精确截断路径 (pos=middle/start)：CSS 只能做 end 截断，中间/首部截断必须靠 JS 测量后切分。
  // 仅单行支持 (measureRows <= 1)；多行 (rows>1) 时 Semi 也不支持中间截断，退化为 end（走 CSS clamp）。
  const initPos: EllipsisPos = initEllipsis?.pos ?? 'end';
  const needsPreciseTruncate = initEllipsis !== null && initPos !== 'end' && measureRows <= 1;
  const needsMeasure =
    initEllipsis !== null &&
    ((initEllipsis.expandable ?? false) ||
      Boolean(initEllipsis.showTooltip) ||
      initEllipsis.suffix !== undefined ||
      needsPreciseTruncate);
  // 精确截断后的显示文本 (state)：仅在 rAF/observer 回调里写（异步首测），
  // 渲染读它但不同步回写 → 无 effect 自循环。null = 尚未测量 / 无需精确截断。
  let truncatedText = $state<string | null>(null);
  // 精确截断的完整原文（首次测量时从 DOM 读到并缓存，供切分与 tooltip 用）。
  let preciseFullText = '';

  // 精确截断（pos=middle/start，单行）：离屏探针命令式测量各候选字符预算是否放得下，
  // 二分（core fitTruncatedText）求最大可容纳的截断串。探针复制宿主字体度量、不换行，
  // 读 scrollWidth 与容器宽比较。写 state 仅在 rAF/observer 回调里 → 与渲染读分离，无自循环。
  let probe: HTMLSpanElement | null = null;
  function measurePreciseNow(): void {
    const el = hostEl;
    if (!el || typeof window === 'undefined') return;
    // 展开态显示完整原文，撤除精确截断。
    if (untrack(() => expanded)) {
      if (untrack(() => truncatedText) !== null) truncatedText = null;
      return;
    }
    // 首测缓存完整原文（此刻宿主渲染的是原文；后续测量沿用缓存，不受已截断 DOM 影响）。
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
    // 对齐宿主当前字体度量（响应主题/字号变化）。
    const cs = window.getComputedStyle(el);
    probe.style.font = cs.font;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.style.fontWeight = cs.fontWeight;
    const containerWidth = el.clientWidth;
    const p = probe;
    const next = fitTruncatedText(full, initPos, (candidate) => {
      p.textContent = candidate;
      return p.scrollWidth <= containerWidth + 1; // 1px 容差吸收亚像素
    });
    const sliced = next === full ? null : next;
    if (untrack(() => truncatedText) !== sliced) truncatedText = sliced;
  }

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
      if (needsPreciseTruncate) {
        measurePreciseNow();
        return;
      }
      // 展开态 clamp 已撤除, scrollHeight==clientHeight, 不会误判
      ellipsisApi.measure({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        rows: measureRows,
      });
    };
    // 首测：DOM 已布局，直接同步测一次落定（写 state 在 onMount 内，渲染读分离，无自循环）。
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

  // 展开/折叠切换时重测精确截断（rAF 异步：折叠回来时宿主已从截断文本切回，需重算；
  // 展开时撤除截断）。写 state 在 rAF 回调里，避免与渲染读写同栈（红线 #4）。
  $effect(() => {
    if (!needsPreciseTruncate) return;
    void expanded; // 依赖 expanded 触发重算
    if (typeof window === 'undefined' || !hostEl) return;
    const frame = window.requestAnimationFrame(measurePreciseNow);
    return () => window.cancelAnimationFrame(frame);
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
    // click 进入宿主：click / text / both 均点宿主进编辑（text/both 对齐 Ant「点文本进编辑」）。
    if (e.type === 'click' && (trig === 'click' || trig === 'text' || trig === 'both')) startEdit(e);
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
  // enterIcon 点击确认（对齐 Ant）。onmousedown preventDefault 抑制 textarea 先 blur，
  // 避免双重 confirm（core confirm 非编辑态幂等 no-op）。
  function confirmEdit(): void {
    editApi?.confirm();
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
      italic && `${baseClass}--italic`,
      spacing === 'extended' && `${baseClass}--spacing-extended`,
      ellipsisCfg && !expanded && `${baseClass}--ellipsis`,
      ellipsisCfg && rows > 1 && !expanded && `${baseClass}--ellipsis-multi`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 编辑态排版 class：继承宿主字号/字重/type 颜色（Title h1、Text small 等），
  // 但剔除会干扰输入的修饰（ellipsis/mark/underline/delete/code/disabled），
  // 编辑框需能换行、无省略、无背景高亮。
  const editCls = $derived(
    [
      baseClass,
      extraClass,
      type !== 'default' && `${baseClass}--${type}`,
      size !== 'default' && !extraClass?.includes(`${baseClass}--title`) && `${baseClass}--size-${size}`,
      strong && `${baseClass}--strong`,
      italic && `${baseClass}--italic`,
      spacing === 'extended' && `${baseClass}--spacing-extended`,
      `${baseClass}__edit-input`,
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
  // 用户内联样式（对齐 Semi style）追加在内部计算样式之后 → 用户样式优先。
  const userStyleNormalized = $derived(
    userStyle && !userStyle.trim().endsWith(';') ? `${userStyle};` : userStyle,
  );
  const hostStyle = $derived(`${inlineWeight}${ellipsisStyle}${userStyleNormalized}`);

  // 有效截断标志：CSS/高度路径用 truncated；精确路径（pos=middle/start）用 truncatedText。
  const isTruncated = $derived(
    needsPreciseTruncate ? truncatedText !== null : truncated === true,
  );
  // tooltip: 仅在确实溢出且 showTooltip 时启用
  const tooltipEnabled = $derived(showTooltip && isTruncated && !expanded);
  // 完整原文：精确路径下 DOM 已被切分，改用缓存的 preciseFullText（以 truncatedText 变化触发重算）。
  // 非精确路径读 DOM（textContent 非响应式，用 truncated/expanded 变化作为重算触发器）。
  const fullText = $derived.by(() => {
    void truncated;
    void truncatedText;
    void expanded;
    if (needsPreciseTruncate && truncatedText !== null && !expanded && preciseFullText) {
      return preciseFullText;
    }
    return textContent();
  });
  // 浮层显示内容：opts.content 自定义优先，否则用完整原文。
  const tooltipContent = $derived(tooltipOpts.content ?? fullText);

  const copyLabel = $derived(loc().t('Typography.copy'));
  const editLabel = $derived(loc().t('Typography.edit'));
  // 编辑图标 tooltip：tooltip===false 隐藏 title；否则用自定义或缺省 editLabel。
  // aria-label 始终 editLabel（隐藏 tooltip 不能丢 a11y）。
  const editTooltip = $derived.by<string | undefined>(() => {
    const t = editableCfg?.tooltip;
    if (t === false) return undefined;
    return t ?? editLabel;
  });
  // 回车确认图标 aria-label。
  const enterLabel = $derived(loc().t('Typography.enter'));
  // 是否显示编辑触发图标：icon / both 显示，click / dblclick / text 不显示。
  const showEditIcon = $derived.by(() => {
    const trig = editableCfg?.trigger ?? 'icon';
    return trig === 'icon' || trig === 'both';
  });
  // enterIcon 是否渲染：默认渲染内置图标；enterIcon===false 隐藏。
  const showEnterIcon = $derived(editableCfg?.enterIcon !== false);
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
{#snippet enterIconDefault()}
  <!-- 回车箭头 ⏎：从右上折回左下 -->
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M20 5v6a2 2 0 0 1-2 2H5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 9l-4 4 4 4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet actions()}
  {#if copyableCfg}
    {#if copyableCfg.render}
      {@render copyableCfg.render(copied, doCopy, copyableCfg)}
    {:else}
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
  {/if}
  {#if editableCfg && showEditIcon}
    <button
      type="button"
      class="{baseClass}__action {baseClass}__action--edit"
      aria-label={editLabel}
      title={editTooltip}
      onclick={startEdit}
    >
      {#if editableCfg.editIcon}{@render editableCfg.editIcon()}{:else}{@render editIconDefault()}{/if}
    </button>
  {/if}
{/snippet}

{#if editApi && editing}
  <!-- inline edit mode: textarea 替换文本；textarea 挂宿主排版 class 继承字号/字重/type 颜色。
       maxLength 硬截断：加原生 maxlength 属性，超出的字符打不进去（core setDraft 也 clamp 兜底）。 -->
  <span class="{baseClass}__edit-wrap">
    <textarea
      bind:this={textareaEl}
      class={editCls}
      value={draft}
      maxlength={editableCfg?.maxLength}
      aria-label={editTooltip ?? editLabel}
      rows="1"
      oninput={onTextareaInput}
      onkeydown={onTextareaKeydown}
      onblur={() => editApi?.confirm()}
    ></textarea>
    {#if showEnterIcon}
      <button
        type="button"
        class="{baseClass}__edit-enter"
        aria-label={enterLabel}
        onmousedown={(e) => e.preventDefault()}
        onclick={confirmEdit}
      >
        {#if editableCfg?.enterIcon}{@render editableCfg.enterIcon()}{:else}{@render enterIconDefault()}{/if}
      </button>
    {/if}
  </span>
{:else if !isInteractive}
  <!-- 纯文本快路径: 与旧实现完全一致 (向后兼容) -->
  <svelte:element this={element} class={cls} style={hostStyle || undefined} aria-disabled={disabled || undefined} {...hostAttrs}>
    {#if icon}<span class="cd-typography__icon">{@render icon()}</span>{/if}{@render children?.()}
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
    {#if icon}<span class="cd-typography__icon">{@render icon()}</span>{/if}{#if needsPreciseTruncate && truncatedText !== null && !expanded}<!--
 精确截断（pos=middle/start）：渲染 JS 测量后切分的文本；完整原文经 preciseFullText/fullText 供 tooltip。
 -->{truncatedText}{:else}{@render children?.()}{/if}{#if ellipsisCfg?.suffix && truncated === true && !expanded}<!--
 -->{ellipsisCfg.suffix}{/if}{#if (expandable && !expanded && truncated === true) || (collapsible && expanded)}<!--
 --><button
      type="button"
      class="{baseClass}__expand"
      aria-expanded={expanded}
      onclick={() => ellipsisApi?.toggle()}
    >{expanded ? collapseLabel : expandLabel}</button>{/if}{@render actions()}
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
    margin-block-end: var(--cd-spacing-base);
  }
  :global(.cd-typography--title) {
    font-weight: var(--cd-font-typography-title-fontweight);
  }
  :global(.cd-typography--h1) {
    font-size: var(--cd-font-size-header-1);
  }
  :global(.cd-typography--h2) {
    font-size: var(--cd-font-size-header-3);
  }
  :global(.cd-typography--h3) {
    font-size: var(--cd-font-size-header-4);
  }
  :global(.cd-typography--h4) {
    font-size: var(--cd-font-size-header-6);
  }
  :global(.cd-typography--h5) {
    font-size: var(--cd-font-size-regular);
  }
  :global(.cd-typography--h6) {
    font-size: var(--cd-font-size-small);
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
  :global(.cd-typography--quaternary) {
    color: var(--cd-typography-color-quaternary);
  }
  :global(.cd-typography--warning) {
    color: var(--cd-color-typography-warning-text-default);
  }
  :global(.cd-typography--danger) {
    color: var(--cd-color-typography-danger-text-default);
  }
  :global(.cd-typography--success) {
    color: var(--cd-color-typography-success-text-default);
  }
  :global(.cd-typography--strong) {
    font-weight: var(--cd-font-typography-strong-fontweight);
  }
  :global(.cd-typography--italic) {
    font-style: italic;
  }
  /* 段落宽松行距（对齐 Semi spacing=extended）。 */
  :global(.cd-typography--spacing-extended) {
    line-height: var(--cd-typography-spacing-extended, 1.8);
  }
  /* 前置图标：与内容间距，链接下不带下划线（符合规范）。 */
  :global(.cd-typography__icon) {
    display: inline-flex;
    align-items: center;
    margin-inline-end: var(--cd-spacing-extra-tight, 4px);
    vertical-align: -0.125em;
  }
  :global(.cd-typography__icon svg) {
    inline-size: 1em;
    block-size: 1em;
  }
  /* 字号档 (Text/Paragraph) — spec §4.1 size + §5 token 表; default 沿用继承字号保持向后兼容 */
  :global(.cd-typography--size-small) {
    font-size: var(--cd-typography-font-size-small, var(--cd-font-size-small));
  }
  :global(.cd-typography--size-large) {
    font-size: var(--cd-typography-font-size-large, var(--cd-font-size-header-6));
  }
  /* size=inherit：继承外层字号（对齐 Semi），用于嵌套在更大/更小文本中 */
  :global(.cd-typography--size-inherit) {
    font-size: inherit;
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
    font-family: var(--cd-font-family-code);
    font-size: var(--cd-typography-code-font-size);
    background-color: var(--cd-typography-code-bg);
    color: var(--cd-typography-code-color); /* 对齐 Semi code 文字 text-2 */
    padding-inline: 0.4em;
    padding-block: 0.1em;
    /* 对齐 Semi：code 描边 + 圆角 token */
    border: var(--cd-width-typography-code-border) solid var(--cd-color-typography-code-border-default);
    border-radius: var(--cd-radius-typography-code);
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
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis-multi)) {
    display: block;
    max-inline-size: 100%;
  }
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis) > .cd-tooltip__trigger),
  :global(.cd-tooltip:has(> .cd-tooltip__trigger > .cd-typography--ellipsis-multi) > .cd-tooltip__trigger) {
    display: block;
    max-inline-size: 100%;
  }
  :global(.cd-typography__action) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: var(--cd-spacing-typography-copyicon-marginleft);
    padding: 2px;
    /* 默认复制/编辑图标为裸图标：无边框、无背景（清 UA button 外观） */
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--cd-typography-action-color);
    cursor: pointer;
    border-radius: 3px;
    vertical-align: middle;
    transition: color var(--cd-motion-duration-fast, 120ms) ease;
  }
  :global(.cd-typography__action:hover) {
    color: var(--cd-typography-action-color-hover);
  }
  :global(.cd-typography__action:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  :global(.cd-typography__action--copy.is-copied) {
    color: var(--cd-color-typography-copied-icon-success);
  }
  :global(.cd-typography__expand) {
    margin-inline-start: var(--cd-spacing-typography-expandtext-marginleft);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--cd-color-typography-link-text-default);
    cursor: pointer;
    font: inherit;
  }
  :global(.cd-typography__expand:hover) {
    color: var(--cd-color-typography-link-text-hover);
  }
  :global(.cd-typography__expand:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: 2px;
  }
  /* ── 编辑态：对齐 Ant Design 内联编辑外观 ──
     wrap 贴合内容宽（inline-flex，不撑满容器）；textarea 继承宿主排版 class
     的字号/字重/type 颜色，仅补齐边框/内边距/换行行为，宽度随内容而非 100%。 */
  :global(.cd-typography__edit-wrap) {
    /* relative：作为 enterIcon 绝对定位（右下角）的定位上下文 */
    position: relative;
    display: inline-flex;
    /* 收缩贴合 textarea 宽度（而非撑满容器）：否则 wrap 被块级上下文拉满，
       而 textarea 靠 field-sizing:content 只占内容宽，enterIcon 定位到 wrap 右缘
       就会飘到 textarea 右侧很远处。fit-content 让 wrap = textarea 宽，图标贴右下角。 */
    inline-size: fit-content;
    max-inline-size: 100%;
    vertical-align: bottom;
  }
  :global(.cd-typography__edit-input) {
    box-sizing: border-box;
    inline-size: auto;
    min-inline-size: 4em;
    max-inline-size: 100%;
    /* 现代浏览器：随内容伸缩宽度；不支持时退回 min/max 约束 + 容器宽度上限 */
    field-sizing: content;
    margin: 0;
    /* 继承宿主字体族/字重/行高，但【不继承 font-size】：
       textarea UA 默认是 monospace 小字，需继承字体族才对齐正文。
       字号必须由 editCls 挂的 --h1/--title/--size-* 类通过 font-size 决定——
       若用 `font: inherit`（含 font-size:inherit），会因源码顺序压掉 --h1 的 font-size，
       导致 Title h1 编辑态退化成正文字号。故拆开继承、留出 font-size 给字号类。 */
    font-family: inherit;
    font-weight: inherit;
    font-style: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    /* 右侧多留出 enterIcon 的空间，避免文字压到图标 */
    padding: 2px 22px 2px 6px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-color-bg-1);
    color: inherit;
    /* 编辑态需换行输入，覆盖可能来自排版 class 的 ellipsis 相关 white-space */
    white-space: pre-wrap;
    overflow-wrap: break-word;
    resize: none;
    overflow: hidden;
  }
  :global(.cd-typography__edit-input:focus-visible) {
    outline: none;
    border-color: var(--cd-color-primary);
    box-shadow: var(--cd-focus-ring);
  }
  /* enterIcon：编辑框右下角回车确认按钮 */
  :global(.cd-typography__edit-enter) {
    position: absolute;
    inset-block-end: 4px;
    inset-inline-end: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1.15em;
    block-size: 1.15em;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--cd-typography-action-color);
    cursor: pointer;
    border-radius: 3px;
    transition: color var(--cd-motion-duration-fast, 120ms) ease;
  }
  :global(.cd-typography__edit-enter:hover) {
    color: var(--cd-typography-action-color-hover);
  }
  :global(.cd-typography__edit-enter:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  :global(.cd-typography__edit-enter svg) {
    inline-size: 1em;
    block-size: 1em;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.cd-typography__action),
    :global(.cd-typography__edit-enter) {
      transition: none;
    }
  }
</style>
