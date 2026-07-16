<!--
  TagInput — see specs/components/input/TagInput.spec.md
  基础子集：标签输入。受控 value 不回写 (红线 #1)，变更仅 onChange。
  受控 inputValue 同理：提供 inputValue 时输入框文本由外部控制，
  键入仅触发 onInputChange，组件不自行写回 (红线 #1)。
  maxTagTextLength: 标签显示文本超长时截断为「前缀…」，完整文本经 title 查看；
  截断仅影响显示派生 (纯函数 truncate)，标签实际值不变 (红线 #1)。
  draggable: 启用后标签可用鼠标拖拽重排，新顺序经 reorder 纯函数 (红线 #2) 算出后
  仅经 onChange 回传 (受控不回写 value，红线 #1)；拖拽监听命令式 + 拖拽态存 $state (红线 #3)。
  拖拽是鼠标增强，键盘增删标签交互不受影响。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useDismiss } from '@chenzy-design/core';
  import { IconClear, IconClose } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { computeInsertSide, reorder, type InsertSide } from './reorder.js';
  import Popover from '../popover/Popover.svelte';
  import { floating } from '../_floating/use-floating.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: string[];
    defaultValue?: string[];
    inputValue?: string;
    defaultInputValue?: string;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    readonly?: boolean;
    max?: number;
    maxLength?: number;
    maxTagTextLength?: number;
    separator?: string | string[];
    addOnBlur?: boolean;
    allowDuplicates?: boolean;
    trimWhitespace?: boolean;
    draggable?: boolean;
    /** 自定义分隔处理函数：给定输入文本与命中的分隔符，返回拆分后的标签数组（对齐 Semi split，优先于内置拆分）。 */
    split?: (value: string, separator: string) => string[];
    /** 输入框前缀（string/图标自动带间隔；自定义 Snippet 间隔为 0）。 */
    prefix?: string | Snippet;
    /** 输入框后缀。 */
    suffix?: string | Snippet;
    /** 标签最大展示数量，超出部分折叠为 +N。 */
    maxTagCount?: number;
    /** 超出 maxTagCount 后 hover +N 是否用 Popover 展示剩余标签（默认 true）。 */
    showRestTagsPopover?: boolean;
    /** +N 的 Popover 配置透传（position/spacing/zIndex 等，对齐 Semi restTagsPopoverProps）。 */
    restTagsPopoverProps?: Record<string, unknown>;
    /** 点击 +N 是否展开剩余标签（默认 true）。 */
    expandRestTagsOnClick?: boolean;
    /** 标签文本截断时 hover 是否用 Tooltip 显示全文（默认 true；替代原生 title）。 */
    showContentTooltip?: boolean;
    onChange?: (tags: string[]) => void;
    onInputChange?: (value: string) => void;
    ariaLabel?: string;
    /** 透传给内部 input 的额外属性（除 value/onChange/onKeyDown 外） */
    inputProps?: Record<string, unknown>;
    /** 完全自定义 tag 渲染 */
    renderTagItem?: Snippet<[{ value: string; index: number; onClose: () => void }]>;
    /** 自定义默认标签的删除图标（不与 renderTagItem 同用）。 */
    removeIcon?: Snippet<[{ index: number }]>;
    /** 建议补全浮层：聚焦且输入非空时展开，snippet 内自定义建议项；add 添加标签、close 关闭浮层。 */
    renderSuggestions?: Snippet<[{ inputValue: string; add: (tag: string) => void; close: () => void }]>;
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
    /** 自定义标签校验：返回 false 或 string（拒绝原因）时拒绝入列，返回 string 时经 onInvalid 上报原因。 */
    validateTag?: (tag: string, current: string[]) => boolean | string;
    /** 标签被 validateTag / 去重 / 空白校验拒绝时触发。 */
    onInvalid?: (detail: { tag: string; reason: string }) => void;
    /** 超出 max 时触发，传当前标签数组（对齐 Semi onExceed）。 */
    onExceed?: (value: string[]) => void;
    /** 单 tag 超出 maxLength 时触发 */
    onInputExceed?: (value: string) => void;
    /** 输入框失焦 */
    onBlur?: (e: FocusEvent) => void;
    /** 输入框聚焦 */
    onFocus?: (e: FocusEvent) => void;
    /** focus 时阻止滚动 */
    preventScroll?: boolean;
    /** 挂载自动聚焦 */
    autoFocus?: boolean;
  }

  let {
    value,
    defaultValue = [],
    inputValue,
    defaultInputValue = '',
    placeholder,
    size = 'default',
    status = 'default',
    disabled = false,
    readonly = false,
    max,
    maxLength,
    maxTagTextLength,
    separator = ['Enter'],
    addOnBlur = false,
    allowDuplicates = false,
    trimWhitespace = true,
    draggable = false,
    split,
    prefix,
    suffix,
    maxTagCount,
    showRestTagsPopover = true,
    restTagsPopoverProps,
    expandRestTagsOnClick = true,
    showContentTooltip = true,
    onChange,
    onInputChange,
    ariaLabel,
    inputProps,
    renderTagItem,
    removeIcon,
    renderSuggestions,
    showClear = false,
    clearIcon,
    onAdd,
    onRemove,
    onKeyDown,
    validateTag,
    onInvalid,
    onExceed,
    onInputExceed,
    onBlur,
    onFocus,
    preventScroll = false,
    autoFocus = false,
  }: Props = $props();

  const loc = useLocale();

  // 截断纯函数：仅影响显示，超过 max 时取前 max 字符 + 省略号 (红线 #2)。
  function truncate(text: string, limit?: number): string {
    if (limit === undefined || limit < 0) return text;
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }

  // --- 受控值 (红线 #1): 不回写 value，仅 onChange ---
  const isControlled = $derived(value !== undefined);
  let inner = $state<string[]>(getInitialValue());
  const current = $derived<string[]>(isControlled ? (value ?? []) : inner);

  function getInitialValue(): string[] {
    return defaultValue;
  }

  // --- 受控 inputValue (红线 #1): 不回写 inputValue，仅 onInputChange ---
  const isInputControlled = $derived(inputValue !== undefined);
  let innerInput = $state<string>(getInitialInput());
  const currentInput = $derived<string>(
    isInputControlled ? (inputValue ?? '') : innerInput,
  );

  function getInitialInput(): string {
    return defaultInputValue;
  }

  function setInput(next: string) {
    if (!isInputControlled) innerInput = next;
    onInputChange?.(next);
  }

  const separators = $derived(
    Array.isArray(separator) ? separator : [separator],
  );

  const atMax = $derived(max !== undefined && current.length >= max);

  // 派生显示文本：实际值不变，仅渲染层截断 (红线 #1/#2)。
  const displayTags = $derived(
    current.map((tag) => ({
      value: tag,
      label: truncate(tag, maxTagTextLength),
      truncated: truncate(tag, maxTagTextLength) !== tag,
    })),
  );

  // 拖拽态（在 collapsed 派生前声明，供其判断拖拽时强制展开）。命令式事件处理见下方拖拽块。
  let dragIndex = $state<number | null>(null); // 被拖拽标签下标
  let dropIndex = $state<number | null>(null); // 当前悬停目标下标
  let dropSide = $state<InsertSide | null>(null); // 插入到目标前/后

  // maxTagCount 折叠：点击 +N 展开后（expandRestTagsOnClick）本地置 true，展示全部。
  // 拖拽态下强制展开（否则拖到折叠区无意义）。
  let restExpanded = $state(false);
  const collapsed = $derived(
    maxTagCount !== undefined &&
      !restExpanded &&
      dragIndex === null &&
      displayTags.length > maxTagCount,
  );
  // 可见标签（折叠时截断到 maxTagCount）与被折叠的剩余标签。
  const visibleTags = $derived(collapsed ? displayTags.slice(0, maxTagCount) : displayTags);
  const restTags = $derived(collapsed ? displayTags.slice(maxTagCount) : []);

  function expandRest() {
    if (expandRestTagsOnClick) restExpanded = true;
  }

  function setTags(next: string[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function clearAll() {
    if (disabled || readonly) return;
    setTags([]);
  }

  // 用命中的分隔符把输入文本拆成候选标签：优先自定义 split，否则按分隔符原样收整段。
  // （字符分隔符的逐字符拆分已在输入阶段由 handleKeydown 逐个 commit，这里主要服务 split 覆盖场景。）
  function splitInput(text: string, sep: string): string[] {
    if (split) return split(text, sep);
    return [text];
  }

  function commitInput(sep = 'Enter') {
    if (disabled || readonly) return;
    let raw = currentInput;
    if (trimWhitespace) raw = raw.trim();
    if (raw === '') {
      setInput('');
      return;
    }
    // 拆分候选标签，逐个 trim + 过滤空串。
    const candidates = splitInput(raw, sep)
      .map((t) => (trimWhitespace ? t.trim() : t))
      .filter((t) => t !== '');
    if (candidates.length === 0) {
      setInput('');
      return;
    }
    const next = [...current];
    for (const text of candidates) {
      // 逐个校验 max（对齐 Semi：超出即回调当前数组并停止继续添加）。
      if (max !== undefined && next.length >= max) {
        onExceed?.(next);
        break;
      }
      // 去重拒绝 → invalid（reason 取自 locale）。
      if (!allowDuplicates && next.includes(text)) {
        onInvalid?.({ tag: text, reason: loc().t('TagInput.duplicate') });
        continue;
      }
      // 自定义校验：false / string 均拒绝；string 作为拒绝原因上报。
      if (validateTag) {
        const result = validateTag(text, next);
        if (result !== true) {
          const reason = typeof result === 'string' ? result : loc().t('TagInput.invalid');
          onInvalid?.({ tag: text, reason });
          continue;
        }
      }
      next.push(text);
    }
    if (next.length !== current.length) {
      setTags(next);
      onAdd?.(next);
    }
    setInput('');
  }

  function removeAt(index: number) {
    if (disabled || readonly) return;
    const removed = current[index];
    setTags(current.filter((_, i) => i !== index));
    if (removed !== undefined) onRemove?.(removed, index);
  }

  function removeLast() {
    if (disabled || readonly) return;
    if (current.length === 0) return;
    const index = current.length - 1;
    const removed = current[index];
    setTags(current.slice(0, -1));
    if (removed !== undefined) onRemove?.(removed, index);
  }

  // --- 拖拽排序：HTML5 DnD（draggable + drag 事件），与库内 Tree 对齐 ---
  // 受控不改 value，仅经 onChange 通知新顺序（红线 #1）；
  // 拖拽态用 $state，事件处理命令式 + drop/dragend 清理（红线 #3）；
  // 插入位置与重排交由 reorder.ts 纯函数计算（红线 #2）。
  const canDrag = $derived(draggable && !disabled && !readonly);

  function resetDrag() {
    dragIndex = null;
    dropIndex = null;
    dropSide = null;
  }

  function onTagDragStart(e: DragEvent, index: number) {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // 必须 setData，否则部分浏览器不触发 drop。
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  function onTagDragOver(e: DragEvent, index: number) {
    if (dragIndex === null) return;
    // dragover 必须 preventDefault 才能触发 drop（红线 #3）。
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropIndex = index;
    dropSide = computeInsertSide(e.clientX - rect.left, rect.width);
  }

  function onTagDragLeave(e: DragEvent, index: number) {
    // 仅当真正离开该标签（而非进入其子元素）时清理目标，避免指示线闪烁。
    const related = e.relatedTarget as Node | null;
    const cur = e.currentTarget as HTMLElement;
    if (related && cur.contains(related)) return;
    if (dropIndex === index) {
      dropIndex = null;
      dropSide = null;
    }
  }

  function onTagDrop(e: DragEvent, index: number) {
    if (dragIndex === null || dropSide === null) {
      resetDrag();
      return;
    }
    e.preventDefault();
    const next = reorder(current, dragIndex, index, dropSide);
    resetDrag();
    // 顺序未变时不发 onChange，避免无意义回调。
    if (next.length === current.length && next.some((t, i) => t !== current[i])) {
      setTags(next);
    }
  }

  function onTagDragEnd() {
    resetDrag();
  }

  function matchesSeparator(e: KeyboardEvent): boolean {
    // 'Enter' 按 key 名匹配；字符分隔符（如 ',' / ';'）按 key 字符匹配。
    return separators.some((sep) => sep === e.key);
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const val = e.currentTarget.value;
    // onInputExceed：单 tag 超出 maxLength 时触发（maxLength 本身已由 input[maxlength] 截断，
    // 此处检测输入值长度超过 maxLength 的情况并回调）。
    if (maxLength !== undefined && val.length > maxLength) {
      onInputExceed?.(val);
    }
    setInput(val);
  }

  function handleKeydown(e: KeyboardEvent) {
    // onKeyDown 透传：先于内部逻辑，消费方可读取任意按键（对齐 Semi）。
    onKeyDown?.(e);
    if (disabled || readonly) return;
    if (matchesSeparator(e)) {
      e.preventDefault();
      commitInput(e.key);
      return;
    }
    if (e.key === 'Backspace' && currentInput === '') {
      e.preventDefault();
      removeLast();
    }
  }

  function handleBlur(e: FocusEvent) {
    if (addOnBlur) commitInput();
    onBlur?.(e);
  }

  function handleFocus(e: FocusEvent) {
    // 聚焦即允许建议浮层展开（实际是否显示还取决于输入是否非空）。
    suggestFocused = true;
    onFocus?.(e);
  }

  let inputEl = $state<HTMLInputElement | null>(null);

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

  // --- 建议补全浮层 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  let suggestPopEl = $state<HTMLDivElement | null>(null);
  let suggestFocused = $state(false);
  // 浮层开：提供了 renderSuggestions + 聚焦 + 输入非空 + 可交互。
  const suggestOpen = $derived(
    renderSuggestions !== undefined &&
      suggestFocused &&
      currentInput.trim() !== '' &&
      !disabled &&
      !readonly,
  );

  // 供建议项调用：按与 commitInput 一致的校验路径添加指定标签（去重 / max / validateTag）。
  function addSuggestion(tag: string) {
    if (disabled || readonly) return;
    let text = tag;
    if (trimWhitespace) text = text.trim();
    if (text === '') return;
    if (max !== undefined && current.length >= max) {
      onExceed?.(current);
      return;
    }
    if (!allowDuplicates && current.includes(text)) {
      onInvalid?.({ tag: text, reason: loc().t('TagInput.duplicate') });
      return;
    }
    if (validateTag) {
      const result = validateTag(text, current);
      if (result !== true) {
        const reason = typeof result === 'string' ? result : loc().t('TagInput.invalid');
        onInvalid?.({ tag: text, reason });
        return;
      }
    }
    const next = [...current, text];
    setTags(next);
    onAdd?.(next);
    setInput('');
  }

  function closeSuggestions() {
    suggestFocused = false;
  }

  // useDismiss（红线 #3）：浮层开时绑外部点击 / Esc 关闭，cleanup 解绑。
  // 浮层经 use:floating portal 到 body，故列入 extraTargets，点击浮层不误判为 outsideClick。
  $effect(() => {
    if (!suggestOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: closeSuggestions,
      escape: true,
      outsideClick: true,
      extraTargets: [suggestPopEl],
    });
    return cleanup;
  });

  /** 命令式聚焦输入框（尊重 preventScroll，对齐 Semi focus()）。 */
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }

  /** 命令式移除焦点（对齐 Semi blur()）。 */
  export function blur(): void {
    inputEl?.blur();
  }

  const cls = $derived(
    [
      'cd-tag-input',
      `cd-tag-input--${size}`,
      `cd-tag-input--${status}`,
      disabled && 'cd-tag-input--disabled',
      readonly && 'cd-tag-input--readonly',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const hasClear = $derived(showClear && !disabled && !readonly && current.length > 0);
</script>

<!-- 点击容器聚焦输入框；容器本身非交互控件，仅做转发 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  bind:this={rootEl}
  class={cls}
  role="group"
  aria-label={ariaLabel}
  aria-disabled={disabled || undefined}
  onclick={focusInput}
>
  {#if prefix !== undefined}
    <span class="cd-tag-input__prefix" class:cd-tag-input__prefix--text={typeof prefix === 'string'}>
      {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
    </span>
  {/if}
  {#each visibleTags as tag, i (`${tag.value}-${i}`)}
    <!-- 标签拖拽为鼠标增强（HTML5 DnD），键盘用户经下方输入框与删除按钮增删，无需此处 role -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
      class="cd-tag-input__tag"
      class:cd-tag-input__tag--dragging={dragIndex === i}
      class:cd-tag-input__tag--drop-before={dropIndex === i && dropSide === 'before'}
      class:cd-tag-input__tag--drop-after={dropIndex === i && dropSide === 'after'}
      draggable={canDrag}
      ondragstart={(e) => onTagDragStart(e, i)}
      ondragover={(e) => onTagDragOver(e, i)}
      ondragleave={(e) => onTagDragLeave(e, i)}
      ondrop={(e) => onTagDrop(e, i)}
      ondragend={onTagDragEnd}
    >
      {#if renderTagItem}
        {@render renderTagItem({ value: tag.value, index: i, onClose: () => removeAt(i) })}
      {:else}
        {#if tag.truncated && showContentTooltip}
          <Popover content={tag.value} trigger="hover" position="top">
            <span class="cd-tag-input__text">{tag.label}</span>
          </Popover>
        {:else}
          <span class="cd-tag-input__text">{tag.label}</span>
        {/if}
        {#if !readonly && !disabled}
          <button
            type="button"
            class="cd-tag-input__remove"
            aria-label={loc().t('TagInput.remove')}
            tabindex={-1}
            onclick={(e) => {
              e.stopPropagation();
              removeAt(i);
            }}
          >
            {#if removeIcon}{@render removeIcon({ index: i })}{:else}<IconClose size="small" />{/if}
          </button>
        {/if}
      {/if}
    </span>
  {/each}

  {#if collapsed && restTags.length > 0}
    {#if showRestTagsPopover}
      <Popover trigger="hover" position="top" {...(restTagsPopoverProps ?? {})}>
        {#snippet content()}
          <div class="cd-tag-input__rest-list">
            {#each restTags as rest (rest.value)}
              <span class="cd-tag-input__rest-item">{rest.value}</span>
            {/each}
          </div>
        {/snippet}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <span
          class="cd-tag-input__rest"
          onclick={(e) => {
            e.stopPropagation();
            expandRest();
          }}
        >+{restTags.length}</span>
      </Popover>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <span
        class="cd-tag-input__rest"
        onclick={(e) => {
          e.stopPropagation();
          expandRest();
        }}
      >+{restTags.length}</span>
    {/if}
  {/if}

  <input
    class="cd-tag-input__input"
    bind:this={inputEl}
    type="text"
    value={currentInput}
    placeholder={current.length === 0 ? placeholder : undefined}
    {disabled}
    {readonly}
    maxlength={maxLength}
    aria-label={ariaLabel}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onblur={handleBlur}
    onfocus={handleFocus}
    {...(inputProps ?? {})}
  />

  {#if hasClear}
    <button
      type="button"
      class="cd-tag-input__clear"
      aria-label={loc().t('TagInput.clear')}
      tabindex={-1}
      onclick={(e) => {
        e.stopPropagation();
        clearAll();
      }}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </button>
  {/if}

  {#if suffix !== undefined}
    <span class="cd-tag-input__suffix" class:cd-tag-input__suffix--text={typeof suffix === 'string'}>
      {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
    </span>
  {/if}

  {#if suggestOpen && renderSuggestions && rootEl}
    <!-- 建议浮层：use:floating portal 到 body 并相对容器定位（自动避让 + 跟随 resize），
         与 Popover/Dropdown 一致，不手搓绝对定位。matchWidth 使浮层与容器同宽。 -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      bind:this={suggestPopEl}
      class="cd-tag-input__suggestions"
      use:floating={{ trigger: rootEl, placement: 'bottomStart', offset: 4, autoAdjust: true, padding: 8, matchWidth: true, open: suggestOpen }}
      onclick={(e) => e.stopPropagation()}
    >
      {@render renderSuggestions({ inputValue: currentInput, add: addSuggestion, close: closeSuggestions })}
    </div>
  {/if}
</div>

<style>
  .cd-tag-input {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    inline-size: 100%;
    min-block-size: var(--cd-height-input-default);
    padding-inline: var(--cd-input-padding-x);
    padding-block: var(--cd-spacing-extra-tight);
    /* 对齐 Semi 填充式：默认灰底(fill-0) + 无边框，hover fill-1，聚焦 fill-0 + 蓝边框 */
    background: var(--cd-input-color-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    cursor: text;
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tag-input--small {
    min-block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-tag-input--large {
    min-block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
  }
  /* 对齐 Semi 填充式：悬浮加深底色 */
  .cd-tag-input:hover:not(.cd-tag-input--disabled):not(:focus-within) {
    background: var(--cd-input-bg-hover);
  }
  .cd-tag-input:focus-within {
    background: var(--cd-input-color-bg);
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tag-input--warning {
    border-color: var(--cd-input-border-warning);
  }
  .cd-tag-input--error {
    border-color: var(--cd-input-border-error);
  }
  .cd-tag-input--disabled {
    background: var(--cd-color-disabled-fill, var(--cd-color-fill-0));
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tag-input--readonly {
    cursor: default;
  }
  .cd-tag-input__tag {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-tag-input-tag-gap);
    padding-inline: var(--cd-tag-input-tag-paddingx);
    background: var(--cd-tag-input-tag-bg);
    border-radius: var(--cd-tag-input-tag-radius);
    font-size: var(--cd-tag-input-tag-font-size);
    white-space: nowrap;
  }
  .cd-tag-input__tag[draggable='true'] {
    cursor: grab;
  }
  .cd-tag-input__tag--dragging {
    opacity: 0.5;
    cursor: grabbing;
  }
  /* 插入指示线：拖拽时显示在目标标签的前 / 后侧（红线 #3 状态驱动渲染）。 */
  .cd-tag-input__tag--drop-before::before,
  .cd-tag-input__tag--drop-after::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inline-size: var(--cd-width-tag-input-sortable-item-over);
    background: var(--cd-color-tag-input-sortable-item-over-bg);
    border-radius: 1px;
  }
  .cd-tag-input__tag--drop-before::before {
    inset-inline-start: calc(var(--cd-spacing-extra-tight) / -2 - 1px);
  }
  .cd-tag-input__tag--drop-after::after {
    inset-inline-end: calc(var(--cd-spacing-extra-tight) / -2 - 1px);
  }
  .cd-tag-input__text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 前后缀：string/icon 自动带间隔，自定义 Snippet 间隔为 0（对齐 Semi）。 */
  .cd-tag-input__prefix,
  .cd-tag-input__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-tag-input__prefix--text {
    margin-inline-end: var(--cd-spacing-tight);
  }
  .cd-tag-input__suffix--text {
    margin-inline-start: var(--cd-spacing-tight);
  }
  /* +N 折叠计数：与标签同款底色，可点击展开。 */
  .cd-tag-input__rest {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    padding-inline: var(--cd-tag-input-tag-paddingx);
    background: var(--cd-tag-input-tag-bg);
    border-radius: var(--cd-tag-input-tag-radius);
    font-size: var(--cd-tag-input-tag-font-size);
    cursor: pointer;
    white-space: nowrap;
  }
  .cd-tag-input__rest-list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    max-inline-size: 240px;
  }
  .cd-tag-input__rest-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 建议补全浮层：定位由 use:floating 接管（portal 到 body），此处只定义外观。 */
  .cd-tag-input__suggestions {
    z-index: var(--cd-z-index-popover, 1030);
    background: var(--cd-color-bg-0);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-input-radius);
    box-shadow: var(--cd-shadow-elevated);
    overflow: auto;
    max-block-size: 240px;
  }
  .cd-tag-input__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-tag-input-remove-color);
    font-size: var(--cd-font-size-header-6);
    line-height: 1;
    cursor: pointer;
  }
  .cd-tag-input__remove:hover {
    color: var(--cd-tag-input-remove-color-hover);
  }
  .cd-tag-input__input {
    flex: 1 1 auto;
    min-inline-size: 4rem;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-tag-input__input::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-tag-input__input:disabled {
    cursor: not-allowed;
  }
  .cd-tag-input__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-tag-input-clear-color);
    cursor: pointer;
  }
  .cd-tag-input__clear:hover {
    color: var(--cd-tag-input-clear-color-hover);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tag-input {
      transition: none;
    }
  }
</style>
