<!--
  TagInput — see specs/components/input/TagInput.spec.md
  基础子集：标签输入。受控 value 不回写 (红线 #1)，变更仅 onChange。
  受控 inputValue 同理：提供 inputValue 时输入框文本由外部控制，
  键入仅触发 onInputChange，组件不自行写回 (红线 #1)。
  maxTagTextLength: 标签显示文本超长时截断为「前缀…」，完整文本经 title 查看；
  截断仅影响显示派生 (纯函数 truncate)，标签实际值不变 (红线 #1)。
  TODO(延后): 拖拽排序。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';

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
    onChange?: (tags: string[]) => void;
    onInputChange?: (value: string) => void;
    ariaLabel?: string;
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
    onChange,
    onInputChange,
    ariaLabel,
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

  function setTags(next: string[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function commitInput() {
    if (disabled || readonly) return;
    let text = currentInput;
    if (trimWhitespace) text = text.trim();
    if (text === '') {
      setInput('');
      return;
    }
    if (atMax) return;
    if (!allowDuplicates && current.includes(text)) {
      setInput('');
      return;
    }
    setTags([...current, text]);
    setInput('');
  }

  function removeAt(index: number) {
    if (disabled || readonly) return;
    setTags(current.filter((_, i) => i !== index));
  }

  function removeLast() {
    if (disabled || readonly) return;
    if (current.length === 0) return;
    setTags(current.slice(0, -1));
  }

  function matchesSeparator(e: KeyboardEvent): boolean {
    // 'Enter' 按 key 名匹配；字符分隔符（如 ',' / ';'）按 key 字符匹配。
    return separators.some((sep) => sep === e.key);
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    setInput(e.currentTarget.value);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled || readonly) return;
    if (matchesSeparator(e)) {
      e.preventDefault();
      commitInput();
      return;
    }
    if (e.key === 'Backspace' && currentInput === '') {
      e.preventDefault();
      removeLast();
    }
  }

  function handleBlur() {
    if (addOnBlur) commitInput();
  }

  let inputEl = $state<HTMLInputElement | null>(null);

  function focusInput() {
    if (disabled) return;
    inputEl?.focus();
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
</script>

<!-- 点击容器聚焦输入框；容器本身非交互控件，仅做转发 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  class={cls}
  role="group"
  aria-label={ariaLabel}
  aria-disabled={disabled || undefined}
  onclick={focusInput}
>
  {#each displayTags as tag, i (`${tag.value}-${i}`)}
    <span class="cd-tag-input__tag">
      <span
        class="cd-tag-input__text"
        title={tag.truncated ? tag.value : undefined}
      >{tag.label}</span>
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
          ×
        </button>
      {/if}
    </span>
  {/each}

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
  />
</div>

<style>
  .cd-tag-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-spacing-1);
    inline-size: 100%;
    min-block-size: var(--cd-input-height-default);
    padding-inline: var(--cd-input-padding-x);
    padding-block: var(--cd-spacing-1);
    background: var(--cd-input-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    cursor: text;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tag-input--small {
    min-block-size: var(--cd-input-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-tag-input--large {
    min-block-size: var(--cd-input-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-tag-input:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tag-input--error {
    border-color: var(--cd-input-border-error);
  }
  .cd-tag-input--disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tag-input--readonly {
    cursor: default;
  }
  .cd-tag-input__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    padding-inline: var(--cd-spacing-2);
    background: var(--cd-color-fill-1);
    border-radius: var(--cd-radius-1);
    font-size: var(--cd-font-size-1);
    white-space: nowrap;
  }
  .cd-tag-input__text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cd-tag-input__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-3);
    line-height: 1;
    cursor: pointer;
  }
  .cd-tag-input__remove:hover {
    color: var(--cd-color-text-0);
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
  @media (prefers-reduced-motion: reduce) {
    .cd-tag-input {
      transition: none;
    }
  }
</style>
