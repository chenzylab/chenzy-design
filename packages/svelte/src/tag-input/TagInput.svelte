<!--
  TagInput — 严格对齐 Semi semi-ui/tagInput/index.tsx。
  受控 value 不回写 (红线 #1)，变更仅 onChange。受控 inputValue 同理：
  提供 inputValue 时输入框文本由外部控制，键入仅触发 onInputChange，不自行写回。

  架构对齐 Semi：
  - 容器 无边框 fill-0 填充式 inline-flex；root .cd-tag-input → prefix + .cd-tag-input-wrapper
    (flex-wrap，含 tag + inputMirror + input) + clearBtn + suffix。
  - 标签复用本库 Tag 组件（color=white type=light size=small|large closable），
    内部文本用 .cd-tag-input-wrapper-typo 单行省略；showContentTooltip 时 hover Popover 显示全文。
  - 提交语义：Enter 提交（把 inputValue 按 separator 拆成多标签），或 addOnBlur 失焦提交；
    默认 separator=','、allowDuplicates=true（对齐 Semi 默认）。
  - inputMirror：隐藏镜像量宽让 input 撑开换行（对齐 Semi updateInputWidth）。

  draggable: 对齐 Semi `_sortable`（dnd-kit 封装：指针拖拽 + IconHandle 手柄触发，
  仅 active 态启用）——复用本库通用 `sortable` action（wrap 模式，core `createSortable`
  的 2D flex-wrap 几何：computeTargetIndexWrap 最近中心命中、computeItemTransformsWrap
  逐项精确挪位，非单轴等距列表假设），而非自造 HTML5 DnD。新顺序经 `arrayMove` 纯函数
  算出后仅经 onChange 回传 (受控不回写 value，红线 #1)。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconClear, IconHandle } from '@chenzy-design/icons';
  import { arrayMove } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { sortable } from '../sortable/index.js';
  import { getSplitedArray } from './split.js';
  import Popover from '../popover/Popover.svelte';
  import Tag from '../tag/Tag.svelte';
  import Paragraph from '../typography/Paragraph.svelte';
  import type { EllipsisConfig } from '../typography/types.js';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error';
  /** showContentTooltip 传对象时透传给 Popover 的配置（对齐 Semi ShowTooltip）。 */
  type ShowTooltip = { type?: 'popover' | 'tooltip'; opts?: Record<string, unknown> };

  interface Props {
    value?: string[];
    defaultValue?: string[];
    inputValue?: string;
    placeholder?: string;
    size?: Size;
    /** 校验状态样式（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    max?: number;
    maxLength?: number;
    /** 分隔符：Enter 提交时按此拆分输入为多标签（对齐 Semi，默认 ','）。 */
    separator?: string | string[];
    addOnBlur?: boolean;
    /** 是否允许重复标签（对齐 Semi，默认 true）。 */
    allowDuplicates?: boolean;
    draggable?: boolean;
    /** 自定义分隔处理函数：给定输入文本与分隔符，返回拆分后的标签数组（对齐 Semi split，优先于内置拆分）。 */
    split?: (value: string, separator: string | string[]) => string[];
    /** 输入框前缀（string/图标自动带间隔）。 */
    prefix?: string | Snippet;
    /** 内嵌 label（前缀位，对齐 Semi insetLabel）。 */
    insetLabel?: string | Snippet;
    /** 内嵌 label 的 id（关联输入，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    /** 输入框后缀。 */
    suffix?: string | Snippet;
    /** prefix/suffix 传 Snippet 时是否按图标间距渲染（对齐 Semi isSemiIcon 判定；Svelte 无法
     * 内省 Snippet 内容，故显式声明，默认 true，同 Input 组件既定约定）。 */
    affixIsIcon?: boolean;
    /** 标签最大展示数量，超出部分折叠为 +N。 */
    maxTagCount?: number;
    /** 超出 maxTagCount 后 hover +N 是否用 Popover 展示剩余标签（默认 true）。 */
    showRestTagsPopover?: boolean;
    /** +N 的 Popover 配置透传（position/spacing/zIndex 等，对齐 Semi restTagsPopoverProps）。 */
    restTagsPopoverProps?: Record<string, unknown>;
    /** 点击 +N 是否展开剩余标签（默认 true）。 */
    expandRestTagsOnClick?: boolean;
    /** 标签文本截断时 hover 是否用 Tooltip 显示全文（默认 true；对齐 Semi showContentTooltip）。 */
    showContentTooltip?: boolean | ShowTooltip;
    onChange?: (tags: string[]) => void;
    onInputChange?: (value: string) => void;
    'aria-label'?: string;
    /** aria-labelledby：关联外部 label 元素（Form.Field 透传 labelId，对齐 Semi）。 */
    ariaLabelledby?: string;
    /** aria-describedby：关联 helpText / extraText（Form.Field 透传）。 */
    ariaDescribedby?: string;
    /** aria-errormessage：error 态关联错误信息容器（Form.Field 透传）。 */
    ariaErrormessage?: string;
    /** aria-required：必填语义（Form.Field required 透传）。 */
    ariaRequired?: boolean;
    /** 完全自定义 tag 渲染（对齐 Semi renderTagItem(value, index, onClose)）。 */
    renderTagItem?: Snippet<[{ value: string; index: number; onClose: () => void }]>;
    /** 显示清除全部按钮 */
    showClear?: boolean;
    /** 自定义清除图标 */
    clearIcon?: Snippet;
    /** 新增标签后触发，传当前完整标签数组（对齐 Semi onAdd）。 */
    onAdd?: (addedValue: string[]) => void;
    /** 移除单个标签时触发，传被移除值与其索引（对齐 Semi onRemove）。 */
    onRemove?: (removedValue: string, index: number) => void;
    /** 输入框 keydown 透传（对齐 Semi onKeyDown）。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 超出 max 时触发，传当前标签数组（对齐 Semi onExceed）。 */
    onExceed?: (value: string[]) => void;
    /** 单 tag 超出 maxLength 时触发（对齐 Semi onInputExceed）。 */
    onInputExceed?: (value: string) => void;
    /** 输入框失焦 */
    onBlur?: (e: FocusEvent) => void;
    /** 输入框聚焦 */
    onFocus?: (e: FocusEvent) => void;
    /** focus 时阻止滚动 */
    preventScroll?: boolean;
    /** 挂载自动聚焦 */
    autoFocus?: boolean;
    /** 根节点自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根节点自定义内联样式（对齐 Semi style）。 */
    style?: string;
  }

  let {
    value,
    defaultValue = [],
    inputValue,
    placeholder,
    size = 'default',
    validateStatus = 'default',
    disabled = false,
    max,
    maxLength,
    separator = ',',
    addOnBlur = false,
    allowDuplicates = true,
    draggable = false,
    split,
    prefix,
    insetLabel,
    insetLabelId,
    suffix,
    affixIsIcon = true,
    maxTagCount,
    showRestTagsPopover = true,
    restTagsPopoverProps,
    expandRestTagsOnClick = true,
    showContentTooltip = true,
    onChange,
    onInputChange,
    'aria-label': ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    renderTagItem,
    showClear = false,
    clearIcon,
    onAdd,
    onRemove,
    onKeyDown,
    onExceed,
    onInputExceed,
    onBlur,
    onFocus,
    preventScroll = false,
    autoFocus = false,
    class: className = '',
    style = '',
  }: Props = $props();

  const loc = useLocale();

  // --- 受控值 (红线 #1): 不回写 value，仅 onChange ---
  const isControlled = $derived(value !== undefined);
  // 仅取 defaultValue 初始值（非受控初始态，对齐 Semi constructor）——闭包读取避免 state_referenced_locally。
  let inner = $state<string[]>(getInitialValue());
  const current = $derived<string[]>(isControlled ? (value ?? []) : inner);

  function getInitialValue(): string[] {
    return defaultValue;
  }

  // --- 受控 inputValue (红线 #1): 不回写 inputValue，仅 onInputChange ---
  const isInputControlled = $derived(inputValue !== undefined);
  let innerInput = $state<string>('');
  const currentInput = $derived<string>(
    isInputControlled ? (inputValue ?? '') : innerInput,
  );

  function setInput(next: string) {
    if (!isInputControlled) innerInput = next;
    onInputChange?.(next);
  }

  // 对齐 Semi index.tsx renderTag：`<Paragraph ellipsis={{ showTooltip: showContentTooltip,
  // rows: 1 }}>{value}</Paragraph>`——tag 文字用 Typography 的 ellipsis+showTooltip 机制，
  // 而非无条件用 Popover 包裹。Paragraph 内部（TypographyBase）用 ResizeObserver 实测
  // scrollWidth vs clientWidth 判定是否真的发生了单行省略截断，只有真截断时才渲染 tooltip
  // 包裹层——短文本（如「抖音」）永远不截断，hover 不显示任何提示（真机核对 semi.design
  // TagInput/Select 拖拽排序 demo 逐一 hover 验证：无论文字长短均无 tooltip 弹出，因为
  // 320px 宽的 tag 容器足够容纳；只有当文字长到真正被单行省略号截断时才触发）。此前用
  // `{#if tooltipEnabled}<Popover trigger="hover">` 无条件包裹，只要 showContentTooltip
  // 不为 false 就恒定显示 tooltip，与文字是否截断无关，是本库自造的过度触发行为。
  const tagEllipsis = $derived<EllipsisConfig>({ rows: 1, showTooltip: showContentTooltip });

  // 拖拽态（在 collapsed 派生前声明）：dragIndex 是当前被拖拽项的索引，供
  // sortable-item-active 样式与 collapsed 强制展开判定使用（命令式赋值见下方拖拽块）。
  let dragIndex = $state<number | null>(null);

  // maxTagCount 折叠：点击 +N 展开后（expandRestTagsOnClick）本地置 true，展示全部。
  // 拖拽态下强制展开（否则拖到折叠区无意义）。
  let restExpanded = $state(false);
  const collapsed = $derived(
    maxTagCount !== undefined &&
      !restExpanded &&
      dragIndex === null &&
      current.length > maxTagCount,
  );
  const visibleTags = $derived(collapsed ? current.slice(0, maxTagCount) : current);
  /* 对齐 Semi renderTags：restTags 复用与可见 tag 同一份渲染（renderTagItem 或默认
     Tag+label），不是裸 value 字符串——Semi getAllTags() 先把全部 tag 渲染成节点，
     再 slice 成 visible/rest 两段，rest popover 里显示的就是同款完整 Tag（label +
     可关闭 ×），故这里带上原始 index，供 tagSnippet 里的 onClose/自定义渲染取用。 */
  const restTags = $derived(
    collapsed
      ? current.slice(maxTagCount).map((tag, ri) => ({ tag, index: (maxTagCount as number) + ri }))
      : [],
  );

  function expandRest() {
    if (expandRestTagsOnClick) restExpanded = true;
  }

  function setTags(next: string[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function clearAll() {
    if (disabled) return;
    setTags([]);
  }

  // 拆分输入：优先自定义 split，否则按分隔符拆（对齐 Semi getSplitedArray）。
  function splitInput(text: string): string[] {
    if (split) return split(text, separator);
    return getSplitedArray(text, separator);
  }

  // Enter / addOnBlur 提交：把 inputValue 按 separator 拆成多标签，去重（可选）+ 过滤空，
  // 超出 max 时 onExceed 并截断（对齐 Semi _handleAddTags）。
  function commitInput() {
    if (disabled) return;
    const raw = currentInput;
    if (raw === '') return;
    let addTags = splitInput(raw);
    addTags = addTags.filter((item, idx) => {
      if (!allowDuplicates) {
        if (current.includes(item) || addTags.indexOf(item) !== idx) return false;
      }
      return typeof item === 'string' && item.trim() !== '';
    });
    let next = [...current, ...addTags];
    if (max !== undefined && next.length > max) {
      onExceed?.(next);
      next = next.slice(0, max);
      addTags = addTags.slice(0, max - current.length);
    }
    if (addTags.length > 0) {
      setTags(next);
      onAdd?.(next);
    }
    setInput('');
  }

  function removeAt(index: number) {
    if (disabled) return;
    const removed = current[index];
    setTags(current.filter((_, i) => i !== index));
    if (removed !== undefined) onRemove?.(removed, index);
  }

  function removeLast() {
    if (disabled) return;
    if (current.length === 0) return;
    const index = current.length - 1;
    const removed = current[index];
    setTags(current.slice(0, -1));
    if (removed !== undefined) onRemove?.(removed, index);
  }

  // focusing 提前声明（原声明在下方 inputEl 附近）。
  let focusing = $state(false);

  // --- 拖拽排序：对齐 Semi `_sortable`（dnd-kit 封装）---
  // 对齐 Semi tagInput/index.tsx renderTags：`if (active && draggable && sortableListItems.length
  // > 0) return <Sortable ...>`——排序能力（含拖拽手柄图标 showIconHandler = active && draggable）
  // 整体由 active 门控。active 语义是「点击容器后到点击容器外部前」（foundation.ts
  // handleClick→setActive(true)，registerClickOutsideHandler 监听 document click，命中
  // 容器外才 clickOutsideCallBack→setActive(false)），与原生 blur 无关、非组件常驻能力。
  // active/rootEl/handleContainerClick 定义见下方（click-outside 实现）；此处仅前置声明
  // canDrag 依赖的 active 供本行引用。
  let active = $state(false);
  const canDrag = $derived(draggable && !disabled && active);

  // 只在拖拽手柄图标（IconHandle）上按下才激活拖拽，对齐 Semi SortableItem.sortableHandle
  // ——`listeners` 只绑在手柄 span 上，标签主体本身不可拖，故这里用 closest 判定命中手柄。
  function resolveTagDragIndex(e: PointerEvent, container: HTMLElement): number {
    if (!canDrag) return -1;
    const target = e.target as HTMLElement | null;
    const handle = target?.closest<HTMLElement>('.cd-tag-input-drag-handler');
    if (!handle) return -1;
    const item = handle.closest<HTMLElement>('[data-sortable-item]');
    if (!item) return -1;
    const items = [...container.querySelectorAll<HTMLElement>('[data-sortable-item]')];
    return items.indexOf(item);
  }

  function handleReorder(from: number, to: number) {
    const next = arrayMove(current, from, to);
    setTags(next);
  }

  // 拖拽目标位置指示线（对齐 Semi &-sortable-item-over::before）：sortable action 每帧
  // 上报 targetIndex（-1 = 未拖拽/已清空），命中项渲染竖线提示将落位到此处。
  let overIndex = $state(-1);

  // --- DragOverlay（对齐 Semi _sortable useDragOverlay:true 默认态）---
  // sortable action 只报告坐标；overlay 内容由本组件用真实的 tagContent snippet 再渲染
  // 一份（而非 cloneNode 克隆 DOM）——克隆会脱离 Paragraph 组件的 ResizeObserver 截断测量
  // 等响应式/副作用状态，导致内容渲染错乱。overlayTop/Left 用 position:fixed 挂在
  // document.body 下（避免被 .cd-tag-input-wrapper 的 overflow:hidden 裁剪），
  // 与列表里半透明的原位置项（-active class）同时存在，构成 dnd-kit 的双层视觉。
  let overlayIndex = $state<number | null>(null);
  let overlayTop = $state(0);
  let overlayLeft = $state(0);

  function handleDragOverlayStart(index: number, rect: DOMRect) {
    overlayIndex = index;
    overlayTop = rect.top;
    overlayLeft = rect.left;
  }
  function handleDragOverlayMove(top: number, left: number) {
    overlayTop = top;
    overlayLeft = left;
  }
  function handleDragOverlayEnd() {
    overlayIndex = null;
  }

  /** 挂载到 document.body（对齐 Popover/Tooltip 既有 portal 模式：appendChild 迁移真实节点，非克隆）。 */
  function portalToBody(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const val = e.currentTarget.value;
    // onInputExceed：拆分后单段超过 maxLength 时触发（对齐 Semi _checkInputChangeValid）。
    if (maxLength !== undefined) {
      const parts = splitInput(val);
      if (parts.some((p) => p.length > maxLength)) onInputExceed?.(val);
    }
    setInput(val);
  }

  function handleKeydown(e: KeyboardEvent) {
    onKeyDown?.(e);
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput !== '') commitInput();
      return;
    }
    if (e.key === 'Backspace' && currentInput === '' && current.length > 0) {
      e.preventDefault();
      removeLast();
    }
  }

  function handleBlur(e: FocusEvent) {
    focusing = false;
    if (addOnBlur) commitInput();
    onBlur?.(e);
  }

  function handleFocus(e: FocusEvent) {
    focusing = true;
    onFocus?.(e);
  }

  let inputEl = $state<HTMLInputElement | null>(null);
  let mirrorEl = $state<HTMLSpanElement | null>(null);
  let hovering = $state(false);

  // --- inputMirror 量宽：有输入时 input 宽度贴合文本（撑开换行），无输入时 flex-grow 占满 ---
  // (对齐 Semi updateInputWidth：镜像同步字体样式后按 scrollWidth 定宽)
  let inputWidth = $state<number | undefined>(undefined);
  $effect(() => {
    // 依赖 currentInput / size / current.length 变化时重算
    void currentInput;
    void size;
    void current.length;
    updateInputWidth();
  });

  function updateInputWidth() {
    if (!inputEl || !mirrorEl) return;
    if (!currentInput) {
      if (inputWidth !== undefined) inputWidth = undefined;
      return;
    }
    try {
      const csAny = window.getComputedStyle(inputEl);
      mirrorEl.style.font = csAny.font;
      mirrorEl.style.letterSpacing = csAny.letterSpacing;
      mirrorEl.style.textTransform = csAny.textTransform;
    } catch {
      /* ignore */
    }
    mirrorEl.textContent = currentInput;
    const next = Math.ceil(mirrorEl.scrollWidth + 2);
    if (Number.isFinite(next) && next > 0 && next !== inputWidth) inputWidth = next;
  }

  // autoFocus：命令式聚焦一次（$effect 仅 client，SSR 安全）。
  $effect(() => {
    if (autoFocus && inputEl && !disabled) {
      inputEl.focus({ preventScroll });
    }
  });

  function focusInput() {
    if (disabled) return;
    inputEl?.focus();
  }

  // 对齐 Semi foundation.ts handleClick/registerClickOutsideHandler：active 由「点击容器」
  // 置 true，仅「点击容器外部」才置回 false——与 blur 无关。此前误用原生 focusing（input
  // 聚焦态）近似 active，但拖拽开始时浏览器会原生 blur 掉输入框（focusin 移出/mousedown
  // 抢占），focusing 瞬间变 false，canDrag 随之为 false，刚拖起就被打断退出排序态
  // （真机复现：鼠标刚拖动就消失）。改用 click-outside 监听，拖拽全程点击目标都在容器内，
  // active 不会被清空。active 已在上方 canDrag 旁前置声明，此处只补 rootEl/监听器。
  let rootEl = $state<HTMLDivElement | null>(null);
  let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

  function handleContainerClick() {
    focusInput();
    if (disabled) return;
    if (clickOutsideHandler) return;
    active = true;
    clickOutsideHandler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (rootEl && target && !rootEl.contains(target)) {
        active = false;
        document.removeEventListener('click', clickOutsideHandler!, false);
        clickOutsideHandler = null;
      }
    };
    document.addEventListener('click', clickOutsideHandler, false);
  }

  $effect(() => {
    return () => {
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler, false);
        clickOutsideHandler = null;
      }
    };
  });

  /** 命令式聚焦输入框（尊重 preventScroll，对齐 Semi focus()）。 */
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }

  /** 命令式移除焦点（对齐 Semi blur()）。 */
  export function blur(): void {
    inputEl?.blur();
  }

  const prefixNode = $derived(prefix ?? insetLabel);
  const hasPrefix = $derived(prefixNode !== undefined);

  const cls = $derived(
    [
      'cd-tag-input',
      focusing && 'cd-tag-input-focus',
      disabled && 'cd-tag-input-disabled',
      hovering && !disabled && 'cd-tag-input-hover',
      validateStatus === 'error' && 'cd-tag-input-error',
      validateStatus === 'warning' && 'cd-tag-input-warning',
      size === 'small' && 'cd-tag-input-small',
      size === 'large' && 'cd-tag-input-large',
      hasPrefix && 'cd-tag-input-with-prefix',
      suffix !== undefined && 'cd-tag-input-with-suffix',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const tagSize = $derived(size === 'small' ? 'small' : 'large');
  // 对齐 Semi index.tsx renderClearBtn：`invisible: !hovering || (inputValue==='' &&
  // tagsArray.length===0) || disabled`——清空按钮独立由 hovering 门控（非 active/focusing），
  // 未 hover 时即便有内容也不显示。此前遗漏 hovering 条件，默认（未 hover）态就已显示。
  const hasClear = $derived(
    showClear && !disabled && hovering && (current.length > 0 || currentInput !== ''),
  );
</script>

<!-- 点击容器聚焦输入框；容器本身非交互控件，仅做转发 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  bind:this={rootEl}
  class={cls}
  {style}
  role="group"
  aria-label={ariaLabel}
  aria-disabled={disabled || undefined}
  onclick={handleContainerClick}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
>
  {#if hasPrefix}
    <!-- -prefix-text / -prefix-icon 变体（对齐 Semi isString(prefix)→text、isSemiIcon(prefix)→icon）：
         insetLabel 走自己的 -inset-label 规则（Semi 同样单列），不叠 icon/text 变体类。 -->
    <div
      class="cd-tag-input-prefix"
      class:cd-tag-input-inset-label={insetLabel !== undefined && prefix === undefined}
      class:cd-tag-input-prefix-text={typeof prefixNode === 'string' && !(insetLabel !== undefined && prefix === undefined)}
      class:cd-tag-input-prefix-icon={typeof prefixNode !== 'string' && affixIsIcon}
      id={insetLabelId}
    >
      {#if typeof prefixNode === 'string'}{prefixNode}{:else if prefixNode}{@render prefixNode()}{/if}
    </div>
  {/if}

  <!-- 单个 tag 内容（对齐 Semi renderTag）：可见 tag 与 restTags popover 里的 tag
       共用同一份渲染（renderTagItem 或默认 Tag+label），而非 popover 内容裸渲染
       value 字符串——Semi getAllTags() 先把全部 tag 渲染成节点再 slice 成两段，
       两段拿到的是同款完整 Tag（自定义 label + 可关闭 ×）。 -->
  {#snippet tagContent(tag: string, i: number)}
    {#if renderTagItem}
      {@render renderTagItem({ value: tag, index: i, onClose: () => removeAt(i) })}
    {:else}
      <Tag
        class={canDrag ? 'cd-tag-input-wrapper-tag cd-tag-input-wrapper-tag-icon' : 'cd-tag-input-wrapper-tag'}
        color="white"
        type="light"
        size={tagSize}
        closable={!disabled}
        visible
        aria-label={`${!disabled ? 'Closable ' : ''}Tag: ${tag}`}
        onClose={(_children, e) => {
          e.preventDefault();
          removeAt(i);
        }}
      >
        {#if canDrag}
          <span class="cd-tag-input-drag-handler"><IconHandle size="small" /></span>
        {/if}
        <Paragraph class="cd-tag-input-wrapper-typo" ellipsis={tagEllipsis}>{tag}</Paragraph>
      </Tag>
    {/if}
  {/snippet}

  <!-- 对齐 Semi renderTags：`active && draggable && sortableListItems.length > 0` 时用
       <Sortable> 渲染；wrap 模式（flex-wrap 多行不定宽）见 core createSortable 的
       computeTargetIndexWrap/computeItemTransformsWrap，拖拽仅由手柄图标触发
       （resolveTagDragIndex 限定 .cd-tag-input-drag-handler 命中）。 -->
  <div
    class="cd-tag-input-wrapper"
    use:sortable={{
      getItemCount: () => visibleTags.length,
      resolveIndexFromEvent: resolveTagDragIndex,
      wrap: true,
      dragOverlay: true,
      // 严格对齐 Semi tagInput/index.tsx：`<Sortable transition={null} .../>`——直接照搬
      // 同一个 prop 及其值，而非另造等价开关。_sortable SortableItem 的 wrapperStyle
      // 就是靠这个值本身门控（`!isNull(transition) ? {transform,transition} : undefined`），
      // 故拖拽过程中不产生任何 transform（真机实测复核：其他项 rect 拖拽前后逐像素相同）。
      transition: null,
      onReorder: handleReorder,
      onDragStart: (i) => (dragIndex = i),
      onDragEnd: () => {
        dragIndex = null;
        overIndex = -1;
      },
      onDragCancel: () => {
        dragIndex = null;
        overIndex = -1;
      },
      onDragOver: (i) => (overIndex = i),
      onDragOverlayStart: handleDragOverlayStart,
      onDragOverlayMove: handleDragOverlayMove,
      onDragOverlayEnd: handleDragOverlayEnd,
    }}
  >
    {#each visibleTags as tag, i (`${i}-${tag}`)}
      <div
        class="cd-tag-input-sortable-item"
        class:cd-tag-input-sortable-item-active={dragIndex === i}
        class:cd-tag-input-sortable-item-over={dragIndex !== null && overIndex === i}
        data-sortable-item
      >
        {@render tagContent(tag, i)}
      </div>
    {/each}

    {#if collapsed && restTags.length > 0}
      {#if showRestTagsPopover}
        <!-- forwardClickToTrigger：popover 内容 portal 到 body，点击其中的 tag
             不会真实冒泡到这个 span（"+N" trigger）。React/Semi 靠虚拟树冒泡
             天然不受影响，本库需显式补上，让点击 popover 里的 tag 跟点击容器
             空白区域一样，能冒泡触发外层（如 Cascader）展开面板。 -->
        <Popover trigger="hover" position="top" showArrow forwardClickToTrigger {...(restTagsPopoverProps ?? {})}>
          {#snippet content()}
            <div class="cd-tag-input-rest-list">
              {#each restTags as { tag, index } (`rest-${index}-${tag}`)}
                {@render tagContent(tag, index)}
              {/each}
            </div>
          {/snippet}
          <!-- 对齐 Semi restTagsContent：`+N` 纯展示 span，不绑定 onClick、不
               stopPropagation——Semi 靠事件自然冒泡到外层容器触发展开面板
               （expandRestTagsOnClick 实际由 TagInput active 焦点态驱动，不是
               "+N" 自己的点击回调，见 renderTags() `!active || !expandRestTagsOnClick`
               判定）。此前 stopPropagation 会吞掉冒泡，让 Cascader 场景点击 +N
               无法像 Semi 一样展开级联面板。 -->
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <span class="cd-tag-input-wrapper-n" class:cd-tag-input-wrapper-n-disabled={disabled}
            >+{current.length - (maxTagCount ?? 0)}</span
          >
        </Popover>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <span class="cd-tag-input-wrapper-n" class:cd-tag-input-wrapper-n-disabled={disabled}
          >+{current.length - (maxTagCount ?? 0)}</span
        >
      {/if}
    {/if}

    <!-- 隐藏镜像：量输入文本宽度让 input 撑开换行（对齐 Semi inputMirror） -->
    <span bind:this={mirrorEl} class="cd-tag-input-wrapper-inputMirror" aria-hidden="true"></span>

    <!-- 对齐 Semi Input 组件结构：原生 input 外包一层 div（承载宽度样式），避免裸 input
         直接参与父级 flex 布局——浏览器给 <input> 的默认 min-content 基线（约等于 20 字符
         宽度）会在 flex-wrap 换行判定时被当作该 flex item 的最小宽度，导致 tag 排满一行后
         input 本该跟着换行占满剩余空间时反被判定"放不下"而独占下一行；div 元素没有这个
         UA 默认最小宽度，包一层即可让 input 正常参与同行布局。 -->
    <div class="cd-tag-input-wrapper-input-box" style:width={inputWidth !== undefined ? `${inputWidth}px` : undefined}>
      <input
        class="cd-tag-input-wrapper-input cd-tag-input-wrapper-input-{size}"
        bind:this={inputEl}
        type="text"
        value={currentInput}
        placeholder={current.length === 0 ? placeholder : undefined}
        {disabled}
        maxlength={maxLength}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-errormessage={ariaErrormessage}
        aria-required={ariaRequired || undefined}
        aria-invalid={validateStatus === 'error' || undefined}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onblur={handleBlur}
        onfocus={handleFocus}
      />
    </div>
  </div>

  {#if overlayIndex !== null}
    <!-- DragOverlay：真实渲染 tagContent snippet（非克隆 DOM），position:fixed 挂 body，
         跟随指针（坐标来自 sortable action 的 onDragOverlayMove）。opacity/cursor 对齐
         Semi dnd-kit DragOverlay 视觉（拖拽副本完全不透明、清晰，与原位置半透明项区分）。
         不显式设置 width/height——内部 Tag 组件是 inline-flex 自适应内容尺寸，强制外层
         固定宽高会与其自然尺寸冲突，导致内部手柄图标/文字失去公共高度基准而错位
         （原始列表项同样不设固定宽高，靠 Tag 自身撑开）。 -->
    <div
      use:portalToBody
      class="cd-tag-input-drag-overlay"
      style:top="{overlayTop}px"
      style:left="{overlayLeft}px"
    >
      {@render tagContent(visibleTags[overlayIndex] as string, overlayIndex)}
    </div>
  {/if}

  {#if showClear}
    <div
      role="button"
      tabindex={0}
      class="cd-tag-input-clearBtn"
      class:cd-tag-input-clearBtn-invisible={!hasClear}
      aria-label={loc().t('TagInput.clear')}
      onclick={(e) => {
        e.stopPropagation();
        clearAll();
      }}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          clearAll();
        }
      }}
    >
      {#if clearIcon}{@render clearIcon()}{:else}<IconClear />{/if}
    </div>
  {/if}

  {#if suffix !== undefined}
    <div
      class="cd-tag-input-suffix"
      class:cd-tag-input-suffix-text={typeof suffix === 'string'}
      class:cd-tag-input-suffix-icon={typeof suffix !== 'string' && affixIsIcon}
    >
      {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
    </div>
  {/if}
</div>

<style>
  /* —— 容器：无边框 fill-0 填充式 inline-flex（对齐 Semi .semi-tagInput，物理属性）—— */
  .cd-tag-input {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    width: 100%;
    min-height: var(--cd-tag-input-height-default);
    background-color: var(--cd-tag-input-default-bg-default);
    border: var(--cd-tag-input-border-width-default) solid var(--cd-tag-input-border-default);
    border-radius: var(--cd-tag-input-radius);
    font-weight: var(--cd-font-weight-regular);
    cursor: text;
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tag-input-small {
    min-height: var(--cd-tag-input-height-small);
  }
  .cd-tag-input-large {
    min-height: var(--cd-tag-input-height-large);
  }

  /* —— 状态：hover / focus（对齐 Semi &-hover / &-focus）—— */
  .cd-tag-input-hover {
    background-color: var(--cd-tag-input-default-bg-hover);
    border-color: var(--cd-tag-input-border-hover);
  }
  .cd-tag-input-focus {
    background-color: var(--cd-tag-input-default-bg-focus);
    border-width: var(--cd-tag-input-border-width-focus);
    border-color: var(--cd-tag-input-border-focus);
  }

  /* —— warning / error（对齐 Semi &-warning / &-error）—— */
  .cd-tag-input-warning {
    background-color: var(--cd-tag-input-warning-bg-default);
    border-color: var(--cd-tag-input-warning-border-default);
  }
  .cd-tag-input-warning.cd-tag-input-hover {
    background-color: var(--cd-tag-input-warning-bg-hover);
    border-color: var(--cd-tag-input-warning-border-hover);
  }
  .cd-tag-input-warning.cd-tag-input-focus {
    background-color: var(--cd-tag-input-warning-bg-focus);
    border-color: var(--cd-tag-input-warning-border-focus);
  }
  .cd-tag-input-error {
    background-color: var(--cd-tag-input-danger-bg-default);
    border-color: var(--cd-tag-input-danger-border-default);
  }
  .cd-tag-input-error.cd-tag-input-hover {
    background-color: var(--cd-tag-input-danger-bg-hover);
    border-color: var(--cd-tag-input-danger-border-hover);
  }
  .cd-tag-input-error.cd-tag-input-focus {
    background-color: var(--cd-tag-input-danger-bg-focus);
    border-color: var(--cd-tag-input-danger-border-focus);
  }

  /* —— disabled（对齐 Semi &-disabled）—— */
  .cd-tag-input-disabled {
    background-color: var(--cd-tag-input-disabled-bg);
    cursor: not-allowed;
  }
  .cd-tag-input-disabled .cd-tag-input-clearBtn,
  .cd-tag-input-disabled .cd-tag-input-prefix,
  .cd-tag-input-disabled .cd-tag-input-suffix {
    color: var(--cd-tag-input-disabled-text-default);
  }
  .cd-tag-input-disabled .cd-tag-input-wrapper,
  .cd-tag-input-disabled .cd-tag-input-wrapper-input {
    cursor: not-allowed;
  }
  .cd-tag-input-disabled .cd-tag-input-wrapper-typo {
    color: var(--cd-tag-input-disabled-text-default);
  }
  /* 对齐 Semi &-disabled &-wrapper-tag：禁用态标签文字色随容器置灰、背景透明
     （复用的 Tag 组件默认 color=white 自带浅底，禁用时需要压平为无底色）。 */
  .cd-tag-input-disabled .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    color: var(--cd-tag-input-disabled-text-default);
    background-color: transparent;
  }
  .cd-tag-input-disabled .cd-tag-input-wrapper-input::placeholder {
    color: var(--cd-tag-input-disabled-text-default);
  }

  /* —— wrapper：flex-wrap 容器（对齐 Semi &-wrapper，物理属性）—— */
  .cd-tag-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
    align-items: center;
    padding-left: var(--cd-spacing-extra-tight);
    padding-right: var(--cd-spacing-extra-tight);
    overflow: hidden;
    position: relative;
  }

  /* 标签（复用 Tag 组件；此处仅补 Semi &-wrapper-tag 外边距 / 换行，物理属性）—— */
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-right: var(--cd-spacing-extra-tight);
    white-space: pre;
    max-width: 100%;
    margin-top: var(--cd-tag-input-default-y);
    margin-bottom: var(--cd-tag-input-default-y);
  }
  .cd-tag-input-small .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-top: var(--cd-tag-input-small-y);
    margin-bottom: var(--cd-tag-input-small-y);
  }
  .cd-tag-input-large .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-top: var(--cd-tag-input-large-y);
    margin-bottom: var(--cd-tag-input-large-y);
  }
  /* 对齐 Semi &-wrapper-tag-icon：带拖拽手柄图标时 tag 左内边距（Tag 组件本身无此
     内边距概念，故用 :global 打洞补在复用的 Tag 根节点上）。 */
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag-icon) {
    padding-left: var(--cd-tag-input-tag-icon-paddingleft);
  }

  /* 标签文本（对齐 Semi &-wrapper-typo）—— */
  .cd-tag-input-wrapper-typo {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--cd-font-size-small);
    /* 配套 Semi @include font-size-small 的 line-height:16px，收敛文字盒高度，
       否则 inline-block 继承祖先 21px line-height 把 tag content 撑到 27px。 */
    line-height: var(--cd-line-height-small);
  }
  /* showContentTooltip 用 Popover 包裹文字，插入 .cd-tag-content > .cd-tooltip >
     .cd-tooltip-trigger 三层 inline 包裹；其 21px 行盒让 16px 的 typo 按 baseline 上浮，
     与几何居中的关闭图标错位 3px。让这三层都 flex 纵向居中，等效 Semi 用块级 Paragraph 由
     Tag 根 all-center 承载文字（实测三层 flex 后文字盒中点与关闭图标中点重合，diff=0）。
     本库既定 scoped + :global 打洞子组件样式（Tooltip/Popover 复用组件的内部 class）。 */
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag-content),
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag-content .cd-tooltip),
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag-content .cd-tooltip-trigger) {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  /* 同一份三层居中修正，补给 DragOverlay 挂载点（不在 .cd-tag-input-wrapper 选择器路径下，
     上面那条规则命中不到，拖拽时浮动副本会重现手柄/文字错位）。 —— */
  .cd-tag-input-drag-overlay :global(.cd-tag-input-wrapper-tag .cd-tag-content),
  .cd-tag-input-drag-overlay :global(.cd-tag-input-wrapper-tag .cd-tag-content .cd-tooltip),
  .cd-tag-input-drag-overlay :global(.cd-tag-input-wrapper-tag .cd-tag-content .cd-tooltip-trigger) {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  /* 拖拽手柄（对齐 Semi &-drag-handler，物理属性）—— */
  .cd-tag-input-drag-handler {
    display: inline-flex;
    align-items: center;
    margin-right: var(--cd-tag-input-drag-handler-marginright);
    color: var(--cd-tag-input-handler-icon-default);
    cursor: move;
  }

  /* +N 折叠计数（对齐 Semi &-wrapper-n，物理属性）—— */
  .cd-tag-input-wrapper-n {
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    margin-right: var(--cd-spacing-extra-tight);
    color: var(--cd-tag-input-maxtagcount-default);
    padding-left: var(--cd-tag-input-wrapper-n-paddingx);
    padding-right: var(--cd-tag-input-wrapper-n-paddingx);
  }
  .cd-tag-input-wrapper-n-disabled {
    cursor: not-allowed;
    color: var(--cd-tag-input-disabled-text-default);
  }

  /* 输入框外层 div（真正参与父级 flex 布局的 item，对齐 Semi Input 组件的 wrapper div：
     div 元素没有浏览器给 <input> 的默认最小宽度基线，换行判定按此处的 min/max 生效，
     物理属性）—— */
  .cd-tag-input-wrapper-input-box {
    flex-grow: 1;
    width: min-content;
    min-width: 2px;
    max-width: 100%;
  }
  /* 输入框（对齐 Semi &-wrapper-input）：撑满外层 div，自身不再是 flex item。
     padding-right 对齐 Semi 内部 Input 组件（.semi-input）的默认右内边距
     （input.scss `$spacing-input-paddingRight`）。padding-left 恒为 0——Semi
     `&-wrapper-input:not(:first-child) > input { padding-left: 0 }` 判定的是
     Input 组件 wrapper 是否为 &-wrapper 的首个子元素；Semi DOM 里 input 前面
     总有一个 inputMirror <span>（`<span inputMirror/><Input/>`，index.tsx:707-708），
     故 Input wrapper 永远不是 :first-child，这条规则恒定生效、左内边距恒为 0；
     本库结构同构（mirror span 同样排在 wrapper-input-box 前面），故直接不声明
     padding-left（不像 Semi 需要靠选择器覆盖默认值，本库这里从未设过默认值）。 —— */
  .cd-tag-input-wrapper-input {
    width: 100%;
    margin: 0;
    border: none;
    outline: none;
    padding-right: var(--cd-spacing-input-paddingright);
    background-color: transparent;
    color: inherit;
    font-size: var(--cd-font-size-regular);
  }
  /* 对齐 Semi &-wrapper-input:hover：hover 时背景保持透明（避免原生 input 的 UA hover 底色）。 */
  .cd-tag-input-wrapper-input:hover {
    background-color: transparent;
  }
  .cd-tag-input-wrapper-input-small {
    height: var(--cd-tag-input-input-small);
    line-height: var(--cd-tag-input-input-small);
    margin-top: var(--cd-tag-input-small-y);
    margin-bottom: var(--cd-tag-input-small-y);
  }
  .cd-tag-input-wrapper-input-default {
    height: var(--cd-tag-input-input-default);
    line-height: var(--cd-tag-input-input-default);
    margin-top: var(--cd-tag-input-default-y);
    margin-bottom: var(--cd-tag-input-default-y);
  }
  .cd-tag-input-wrapper-input-large {
    height: var(--cd-tag-input-input-large);
    line-height: var(--cd-tag-input-input-large);
    margin-top: var(--cd-tag-input-large-y);
    margin-bottom: var(--cd-tag-input-large-y);
  }
  .cd-tag-input-wrapper-input::placeholder {
    color: var(--cd-color-text-2);
  }
  .cd-tag-input-wrapper-input:disabled {
    cursor: not-allowed;
  }

  /* 隐藏镜像（对齐 Semi &-wrapper-inputMirror）—— */
  .cd-tag-input-wrapper-inputMirror {
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    pointer-events: none;
    height: 0;
    overflow: hidden;
    white-space: pre;
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-weight-regular);
    font-family: inherit;
  }

  /* 拖拽项（对齐 Semi &-sortable-item，物理属性）：max-width:100% 防止长文字标签
     溢出容器；relative 承载被拖拽项的 z-index/position 提升（sortable action 命令式
     写入，见 use:sortable applyTransforms）。 —— */
  .cd-tag-input-sortable-item {
    position: relative;
    max-width: 100%;
  }
  /* 对齐 Semi &-sortable-item-active：正在被拖拽的项半透明（dnd-kit DragOverlay
     接管视觉，原位置项降透明度）。 —— */
  .cd-tag-input-sortable-item-active {
    opacity: 0.5;
  }
  /* DragOverlay 浮动副本（对齐 Semi &-drag-item-move z-index:2000）：position:fixed
     挂 body，跟随指针，不透明、不响应事件。 —— */
  .cd-tag-input-drag-overlay {
    position: fixed;
    z-index: 2000;
    margin: 0;
    pointer-events: none;
    box-sizing: border-box;
  }
  /* 对齐 Semi &-sortable-item-over::before：拖拽经过的目标项左侧画一条竖线提示落位
     （物理属性，固定左侧，非 before/after 双侧——Semi 源码只有这一种）。 —— */
  .cd-tag-input-sortable-item-over {
    overflow: visible;
  }
  .cd-tag-input-sortable-item-over::before {
    content: '';
    display: block;
    position: absolute;
    left: calc(var(--cd-tag-input-sortable-item-over) * -1);
    top: 0;
    width: var(--cd-tag-input-sortable-item-over);
    height: 100%;
    background-color: var(--cd-tag-input-sortable-item-over-bg);
  }

  /* +N 剩余标签浮层列表：对齐 Semi content={restTags}——Popover content 直接是一份
     Tag 数组，没有额外容器强制纵向堆叠。Tag 自身 display:inline-flex（tag.scss），
     多个 Tag 在默认块级容器里天然按行内流排布、空间不够自动换行，故这里只需
     flex-wrap（非 column），间距靠 gap 补足（Tag 间无自带 margin）。 */
  .cd-tag-input-rest-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    max-width: 240px;
  }

  /* 清除按钮（对齐 Semi &-clearBtn，物理属性）—— */
  .cd-tag-input-clearBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-tag-input-clear-medium);
    flex-shrink: 0;
    color: var(--cd-tag-input-icon-default);
    cursor: pointer;
  }
  .cd-tag-input-clearBtn:hover {
    color: var(--cd-tag-input-icon-hover);
  }
  .cd-tag-input-clearBtn-invisible {
    visibility: hidden;
  }

  /* prefix / suffix / insetLabel（对齐 Semi &-prefix / &-suffix / &-inset-label，物理属性）—— */
  .cd-tag-input-prefix,
  .cd-tag-input-suffix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--cd-tag-input-prefix-default);
  }
  .cd-tag-input-prefix-text,
  .cd-tag-input-suffix-text {
    margin-left: var(--cd-tag-input-prefix-suffix-marginx);
    margin-right: var(--cd-tag-input-prefix-suffix-marginx);
    font-weight: var(--cd-tag-input-prefix-suffix-fontweight);
    white-space: nowrap;
  }
  /* prefix/suffix 传图标时的窄间距变体（对齐 Semi &-prefix-icon/&-suffix-icon）—— */
  .cd-tag-input-prefix-icon,
  .cd-tag-input-suffix-icon {
    color: var(--cd-tag-input-icon-default);
    margin-left: var(--cd-spacing-tight);
    margin-right: var(--cd-spacing-tight);
  }
  .cd-tag-input-suffix {
    color: var(--cd-tag-input-suffix-default);
  }
  .cd-tag-input-inset-label {
    margin-left: var(--cd-tag-input-prefix-suffix-marginx);
    margin-right: var(--cd-tag-input-prefix-suffix-marginx);
    font-weight: var(--cd-tag-input-prefix-suffix-fontweight);
    color: var(--cd-tag-input-prefix-default);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tag-input {
      transition: none;
    }
  }

  /* —— RTL 镜像（对齐 Semi semi-foundation/tagInput/rtl.scss）——
     本库 RTL 触发机制是 `:global(.cd-rtl) .cd-<comp>`（非 [dir=rtl]/:dir()，
     见 packages/svelte/scripts/check-rtl-scope.mjs 说明），物理属性正向已用
     margin-left/right、padding-left/right，故 RTL 只需把左右值互换镜像即可。 */
  :global(.cd-rtl) .cd-tag-input {
    direction: rtl;
  }
  /* 对齐 Semi &-wrapper &-tag：margin-left 顶替正向 margin-right，margin-right 归零 —— */
  :global(.cd-rtl) .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-left: var(--cd-spacing-extra-tight);
    margin-right: 0;
  }
  /* 对齐 Semi &-wrapper-input:not(:first-child) > input { padding-right: 0 }：
     正向左内边距恒为 0（mirror span 恒排 input 前），RTL 下对称地把右内边距清零，
     左侧（视觉起始侧）改吃 Semi 的 $spacing-input-paddingRight。 —— */
  :global(.cd-rtl) .cd-tag-input-wrapper-input {
    padding-left: var(--cd-spacing-input-paddingright);
    padding-right: 0;
  }
</style>
