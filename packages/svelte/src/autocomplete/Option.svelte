<!--
  Option — 严格对齐 Semi Design（semi-ui/autoComplete/option.tsx）。
  AutoComplete 单个候选项的渲染单元：与 AutoComplete.svelte 对应 Semi index.tsx + option.tsx 的
  两文件拆分（Semi AutoComplete 恒 showTick=false 调用，但 Option 自身仍需完整实现 showTick/
  IconTick 分支，对齐 Semi option.tsx render() 的完整实现，而非因调用方用不到就阉割）。

  对齐要点：
  - showTick 为 true 时左侧渲染 IconTick（对齐 Semi option.tsx `<IconTick/>`，具名图标而非内联 svg）。
  - 字符串 children 经 Highlight 高亮 inputValue 命中片段，包 cd-autocomplete-option-text 层
    （对齐 Semi renderOptionContent + option-text）；非字符串 children 原样渲染（对齐 Semi
    `isString(children) ? <div className={text}>...</div> : children`）。
  - empty 态：emptyContent 为空则不渲染（对齐 Semi `emptyContent === null` 时 return null）。
  - renderOptionItem 逃生口：完全自定义单项渲染，入参对齐 Semi（value/label/disabled/focused/
    selected/inputValue + onMouseEnter/onClick 回调）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconTick } from '@chenzy-design/icons';
  import Highlight from '../highlight/Highlight.svelte';

  interface RenderOptionItemArgs {
    disabled: boolean;
    focused: boolean;
    selected: boolean;
    label: string | undefined;
    value: string | number | undefined;
    inputValue: string | undefined;
    onMouseEnter: () => void;
    onClick: () => void;
  }

  interface Props {
    value?: string | number;
    label?: string;
    /** 自定义内容（非字符串时原样渲染，跳过 Highlight）。 */
    children?: Snippet;
    disabled?: boolean;
    selected?: boolean;
    /** 空态占位项。 */
    empty?: boolean;
    emptyContent?: Snippet | string;
    onSelect: (value: string | number, label: string) => void;
    focused?: boolean;
    /** 左侧是否展示选中对勾（对齐 Semi showTick，AutoComplete 恒传 false）。 */
    showTick?: boolean;
    class?: string;
    style?: string;
    onMouseEnter?: () => void;
    /** 高亮匹配用的当前输入值。 */
    inputValue?: string;
    /** 完全自定义单项渲染（对齐 Semi renderOptionItem）。 */
    renderOptionItem?: Snippet<[RenderOptionItemArgs]>;
    id?: string;
  }

  let {
    value,
    label,
    children,
    disabled = false,
    selected = false,
    empty = false,
    emptyContent,
    onSelect,
    focused = false,
    showTick = false,
    class: className = '',
    style,
    onMouseEnter,
    inputValue,
    renderOptionItem,
    id,
  }: Props = $props();

  function handleClick() {
    if (disabled) return;
    onSelect(value as string | number, label ?? '');
  }

  const optionClass = $derived(
    [
      'cd-autocomplete-option',
      disabled && 'cd-autocomplete-option-disabled',
      selected && 'cd-autocomplete-option-selected',
      focused && 'cd-autocomplete-option-focused',
      empty && 'cd-autocomplete-option-empty',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if empty}
  {#if emptyContent !== undefined}
    <div class={optionClass} {style}>
      {#if typeof emptyContent === 'string'}{emptyContent}{:else}{@render emptyContent()}{/if}
    </div>
  {/if}
{:else if renderOptionItem}
  {@render renderOptionItem({
    disabled,
    focused,
    selected,
    label,
    value,
    inputValue,
    onMouseEnter: () => onMouseEnter?.(),
    onClick: handleClick,
  })}
{:else}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={optionClass}
    {id}
    {style}
    onclick={handleClick}
    onmouseenter={() => onMouseEnter?.()}
    role="option"
    aria-selected={selected}
    aria-disabled={disabled}
    tabindex="-1"
  >
    {#if showTick}
      <div class="cd-autocomplete-option-icon">
        <IconTick />
      </div>
    {/if}
    {#if children}
      {@render children()}
    {:else if label !== undefined}
      <div class="cd-autocomplete-option-text">
        {#if inputValue}
          <Highlight
            sourceString={label}
            searchWords={[inputValue]}
            highlightClassName="cd-autocomplete-option-keyword"
          />
        {:else}
          {label}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .cd-autocomplete-option {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    position: relative;
    box-sizing: border-box;
    word-break: break-all;
    padding-left: var(--cd-autocomplete-option-padding-left);
    padding-right: var(--cd-autocomplete-option-padding-right);
    padding-top: var(--cd-autocomplete-option-padding-top);
    padding-bottom: var(--cd-autocomplete-option-padding-bottom);
    color: var(--cd-autocomplete-option-main-text);
    background-color: var(--cd-autocomplete-option-bg-default);
    border-radius: var(--cd-autocomplete-option-radius);
    cursor: pointer;
    transition: background-color var(--cd-transition-duration-autocomplete-option-bg) var(--cd-transition-function-autocomplete-option-bg) var(--cd-transition-delay-autocomplete-option-bg);
  }
  .cd-autocomplete-option:first-of-type {
    margin-top: var(--cd-autocomplete-option-first-margin-top);
  }
  .cd-autocomplete-option:last-of-type {
    margin-bottom: var(--cd-autocomplete-option-last-margin-bottom);
  }
  .cd-autocomplete-option:active {
    background-color: var(--cd-autocomplete-option-bg-active);
  }
  .cd-autocomplete-option-icon {
    width: var(--cd-autocomplete-option-tick-width);
    color: var(--cd-autocomplete-option-icon-default);
    visibility: hidden;
    margin-right: var(--cd-autocomplete-option-tick-margin-right);
    display: flex;
    justify-content: center;
    align-content: center;
  }
  .cd-autocomplete-option-text {
    display: flex;
    flex-wrap: wrap;
    white-space: pre;
  }
  :global(.cd-autocomplete-option-keyword) {
    color: var(--cd-autocomplete-option-keyword-text);
    background-color: inherit;
    font-weight: var(--cd-autocomplete-keyword-font-weight);
  }
  .cd-autocomplete-option-empty {
    cursor: not-allowed;
    color: var(--cd-autocomplete-option-disabled-text);
    justify-content: center;
  }
  .cd-autocomplete-option-empty:hover,
  .cd-autocomplete-option-empty:active {
    background-color: inherit;
  }
  .cd-autocomplete-option-disabled {
    color: var(--cd-autocomplete-option-disabled-text);
    cursor: not-allowed;
  }
  .cd-autocomplete-option-disabled:hover {
    background-color: var(--cd-autocomplete-option-bg-hover);
  }
  .cd-autocomplete-option-selected {
    font-weight: var(--cd-font-weight-bold);
  }
  .cd-autocomplete-option-selected .cd-autocomplete-option-icon {
    visibility: visible;
    color: var(--cd-autocomplete-option-icon-active);
  }
  .cd-autocomplete-option-focused {
    background-color: var(--cd-autocomplete-option-bg-hover);
  }
</style>
