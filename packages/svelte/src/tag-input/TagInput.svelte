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

  draggable: HTML5 DnD 拖拽重排为鼠标增强，新顺序经 reorder 纯函数 (红线 #2) 算出后
  仅经 onChange 回传 (受控不回写 value，红线 #1)；拖拽态存 $state (红线 #3)。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconClear, IconHandle } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { computeInsertSide, reorder, type InsertSide } from './reorder.js';
  import { getSplitedArray } from './split.js';
  import Popover from '../popover/Popover.svelte';
  import Tag from '../tag/Tag.svelte';

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
    ariaLabel?: string;
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
    maxTagCount,
    showRestTagsPopover = true,
    restTagsPopoverProps,
    expandRestTagsOnClick = true,
    showContentTooltip = true,
    onChange,
    onInputChange,
    ariaLabel,
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

  // showContentTooltip 归一：boolean → 是否显示；对象 → 显示 + Popover 配置。
  const tooltipEnabled = $derived(showContentTooltip !== false);
  const tooltipProps = $derived(
    typeof showContentTooltip === 'object' ? (showContentTooltip.opts ?? {}) : {},
  );

  // 拖拽态（在 collapsed 派生前声明）。命令式事件处理见下方拖拽块。
  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);
  let dropSide = $state<InsertSide | null>(null);

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
  const restTags = $derived(collapsed ? current.slice(maxTagCount) : []);

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

  // --- 拖拽排序：HTML5 DnD（draggable + drag 事件）---
  const canDrag = $derived(draggable && !disabled);

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
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  function onTagDragOver(e: DragEvent, index: number) {
    if (dragIndex === null) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropIndex = index;
    dropSide = computeInsertSide(e.clientX - rect.left, rect.width);
  }

  function onTagDragLeave(e: DragEvent, index: number) {
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
    if (next.length === current.length && next.some((t, i) => t !== current[i])) {
      setTags(next);
    }
  }

  function onTagDragEnd() {
    resetDrag();
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
  let focusing = $state(false);
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
  const hasClear = $derived(showClear && !disabled && (current.length > 0 || currentInput !== ''));
</script>

<!-- 点击容器聚焦输入框；容器本身非交互控件，仅做转发 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  class={cls}
  {style}
  role="group"
  aria-label={ariaLabel}
  aria-disabled={disabled || undefined}
  onclick={focusInput}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
>
  {#if hasPrefix}
    <div
      class="cd-tag-input-prefix"
      class:cd-tag-input-inset-label={insetLabel !== undefined && prefix === undefined}
      class:cd-tag-input-prefix-text={typeof prefixNode === 'string'}
      id={insetLabelId}
    >
      {#if typeof prefixNode === 'string'}{prefixNode}{:else if prefixNode}{@render prefixNode()}{/if}
    </div>
  {/if}

  <div class="cd-tag-input-wrapper">
    {#each visibleTags as tag, i (`${i}-${tag}`)}
      <!-- 拖拽包裹层：HTML5 DnD 为鼠标增强，键盘用户经删除按钮增删 -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="cd-tag-input-sortable-item"
        class:cd-tag-input-sortable-item-over={dropIndex === i}
        class:cd-tag-input-sortable-item-over-before={dropIndex === i && dropSide === 'before'}
        class:cd-tag-input-sortable-item-over-after={dropIndex === i && dropSide === 'after'}
        class:cd-tag-input-sortable-item-active={dragIndex === i}
        draggable={canDrag}
        ondragstart={(e) => onTagDragStart(e, i)}
        ondragover={(e) => onTagDragOver(e, i)}
        ondragleave={(e) => onTagDragLeave(e, i)}
        ondrop={(e) => onTagDrop(e, i)}
        ondragend={onTagDragEnd}
      >
        {#if renderTagItem}
          {@render renderTagItem({ value: tag, index: i, onClose: () => removeAt(i) })}
        {:else}
          <Tag
            class="cd-tag-input-wrapper-tag"
            color="white"
            type="light"
            size={tagSize}
            closable={!disabled}
            visible
            ariaLabel={`${!disabled ? 'Closable ' : ''}Tag: ${tag}`}
            onClose={(_children, e) => {
              e.preventDefault();
              removeAt(i);
            }}
          >
            {#if canDrag}
              <span class="cd-tag-input-drag-handler"><IconHandle size="small" /></span>
            {/if}
            {#if tooltipEnabled}
              <Popover content={tag} trigger="hover" position="top" {...tooltipProps}>
                <span class="cd-tag-input-wrapper-typo">{tag}</span>
              </Popover>
            {:else}
              <span class="cd-tag-input-wrapper-typo">{tag}</span>
            {/if}
          </Tag>
        {/if}
      </div>
    {/each}

    {#if collapsed && restTags.length > 0}
      {#if showRestTagsPopover}
        <Popover trigger="hover" position="top" showArrow {...(restTagsPopoverProps ?? {})}>
          {#snippet content()}
            <div class="cd-tag-input-rest-list">
              {#each restTags as rest, ri (`rest-${ri}-${rest}`)}
                <span class="cd-tag-input-rest-item">{rest}</span>
              {/each}
            </div>
          {/snippet}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <span
            class="cd-tag-input-wrapper-n"
            class:cd-tag-input-wrapper-n-disabled={disabled}
            onclick={(e) => {
              e.stopPropagation();
              expandRest();
            }}
          >+{current.length - (maxTagCount ?? 0)}</span>
        </Popover>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <span
          class="cd-tag-input-wrapper-n"
          class:cd-tag-input-wrapper-n-disabled={disabled}
          onclick={(e) => {
            e.stopPropagation();
            expandRest();
          }}
        >+{current.length - (maxTagCount ?? 0)}</span>
      {/if}
    {/if}

    <!-- 隐藏镜像：量输入文本宽度让 input 撑开换行（对齐 Semi inputMirror） -->
    <span bind:this={mirrorEl} class="cd-tag-input-wrapper-inputMirror" aria-hidden="true"></span>

    <input
      class="cd-tag-input-wrapper-input cd-tag-input-wrapper-input-{size}"
      bind:this={inputEl}
      type="text"
      value={currentInput}
      style:width={inputWidth !== undefined ? `${inputWidth}px` : undefined}
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
    <div class="cd-tag-input-suffix" class:cd-tag-input-suffix-text={typeof suffix === 'string'}>
      {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
    </div>
  {/if}
</div>

<style>
  /* —— 容器：无边框 fill-0 填充式 inline-flex（对齐 Semi .semi-tagInput）—— */
  .cd-tag-input {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    inline-size: 100%;
    min-block-size: var(--cd-tag-input-height-default);
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
    min-block-size: var(--cd-tag-input-height-small);
  }
  .cd-tag-input-large {
    min-block-size: var(--cd-tag-input-height-large);
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
  .cd-tag-input-disabled .cd-tag-input-wrapper-input::placeholder {
    color: var(--cd-tag-input-disabled-text-default);
  }

  /* —— wrapper：flex-wrap 容器（对齐 Semi &-wrapper）—— */
  .cd-tag-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
    align-items: center;
    padding-inline: var(--cd-spacing-extra-tight);
    overflow: hidden;
    position: relative;
  }

  /* 标签（复用 Tag 组件；此处仅补 Semi &-wrapper-tag 外边距 / 换行）—— */
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-inline-end: var(--cd-spacing-extra-tight);
    white-space: pre;
    max-inline-size: 100%;
    margin-block: var(--cd-tag-input-default-y);
  }
  .cd-tag-input-small .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-block: var(--cd-tag-input-small-y);
  }
  .cd-tag-input-large .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag) {
    margin-block: var(--cd-tag-input-large-y);
  }

  /* 标签文本（对齐 Semi &-wrapper-typo）—— */
  .cd-tag-input-wrapper-typo {
    display: inline-block;
    max-inline-size: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--cd-font-size-small);
    /* 配套 Semi @include font-size-small 的 line-height:16px，收敛文字盒高度，
       否则 inline-block 继承祖先 21px line-height 把 tag content 撑到 27px。 */
    line-height: var(--cd-line-height-small);
  }
  /* showContentTooltip 用 Popover 包裹文字，插入 .cd-tag__content > .cd-tooltip >
     .cd-tooltip__trigger 三层 inline 包裹；其 21px 行盒让 16px 的 typo 按 baseline 上浮，
     与几何居中的关闭图标错位 3px。让这三层都 flex 纵向居中，等效 Semi 用块级 Paragraph 由
     Tag 根 all-center 承载文字（实测三层 flex 后文字盒中点与关闭图标中点重合，diff=0）。
     本库既定 scoped + :global 打洞子组件样式（Tooltip/Popover 复用组件的内部 class）。 */
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag__content),
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag__content .cd-tooltip),
  .cd-tag-input-wrapper :global(.cd-tag-input-wrapper-tag .cd-tag__content .cd-tooltip__trigger) {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  /* 拖拽手柄（对齐 Semi &-drag-handler）—— */
  .cd-tag-input-drag-handler {
    display: inline-flex;
    align-items: center;
    margin-inline-end: var(--cd-tag-input-drag-handler-marginright);
    color: var(--cd-tag-input-handler-icon-default);
    cursor: move;
  }

  /* +N 折叠计数（对齐 Semi &-wrapper-n）—— */
  .cd-tag-input-wrapper-n {
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    margin-inline-end: var(--cd-spacing-extra-tight);
    color: var(--cd-tag-input-maxtagcount-default);
    padding-inline: var(--cd-tag-input-wrapper-n-paddingx);
  }
  .cd-tag-input-wrapper-n-disabled {
    cursor: not-allowed;
    color: var(--cd-tag-input-disabled-text-default);
  }

  /* 输入框（对齐 Semi &-wrapper-input）—— */
  .cd-tag-input-wrapper-input {
    flex-grow: 1;
    inline-size: min-content;
    min-inline-size: 2px;
    max-inline-size: 100%;
    margin: 0;
    border: none;
    outline: none;
    background-color: transparent;
    color: inherit;
    font-size: var(--cd-font-size-regular);
  }
  .cd-tag-input-wrapper-input-small {
    block-size: var(--cd-tag-input-input-small);
    line-height: var(--cd-tag-input-input-small);
    margin-block: var(--cd-tag-input-small-y);
  }
  .cd-tag-input-wrapper-input-default {
    block-size: var(--cd-tag-input-input-default);
    line-height: var(--cd-tag-input-input-default);
    margin-block: var(--cd-tag-input-default-y);
  }
  .cd-tag-input-wrapper-input-large {
    block-size: var(--cd-tag-input-input-large);
    line-height: var(--cd-tag-input-input-large);
    margin-block: var(--cd-tag-input-large-y);
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

  /* 拖拽指示线（对齐 Semi &-sortable-item-over::before）—— */
  .cd-tag-input-sortable-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    max-inline-size: 100%;
  }
  .cd-tag-input-sortable-item-active {
    opacity: 0.5;
  }
  .cd-tag-input-sortable-item-over {
    overflow: visible;
  }
  .cd-tag-input-sortable-item-over-before::before,
  .cd-tag-input-sortable-item-over-after::after {
    content: '';
    display: block;
    position: absolute;
    inset-block: 0;
    inline-size: var(--cd-tag-input-sortable-item-over);
    background-color: var(--cd-tag-input-sortable-item-over-bg);
  }
  .cd-tag-input-sortable-item-over-before::before {
    inset-inline-start: calc(var(--cd-tag-input-sortable-item-over) * -1);
  }
  .cd-tag-input-sortable-item-over-after::after {
    inset-inline-end: calc(var(--cd-tag-input-sortable-item-over) * -1);
  }

  /* +N 剩余标签浮层列表 —— */
  .cd-tag-input-rest-list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    max-inline-size: 240px;
  }
  .cd-tag-input-rest-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 清除按钮（对齐 Semi &-clearBtn）—— */
  .cd-tag-input-clearBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-tag-input-clear-medium);
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

  /* prefix / suffix / insetLabel（对齐 Semi &-prefix / &-suffix / &-inset-label）—— */
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
    margin-inline: var(--cd-tag-input-prefix-suffix-marginx);
    font-weight: var(--cd-tag-input-prefix-suffix-fontweight);
    white-space: nowrap;
  }
  .cd-tag-input-suffix {
    color: var(--cd-tag-input-suffix-default);
  }
  .cd-tag-input-inset-label {
    margin-inline: var(--cd-tag-input-prefix-suffix-marginx);
    font-weight: var(--cd-tag-input-prefix-suffix-fontweight);
    color: var(--cd-tag-input-prefix-default);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tag-input {
      transition: none;
    }
  }
</style>
