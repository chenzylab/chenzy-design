<!--
  SplitButtonGroup — 分裂按钮：左侧主 Button + 右侧带下拉箭头的小 Button。
  右侧小按钮点击触发 Dropdown（复用现有 Dropdown 的 items API / menu snippet）。
  视觉上两者拼接、中间细分隔；主按钮 type/theme 透传给两侧。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import { Dropdown } from '../dropdown/index.js';
  import type { DropdownItem } from '../dropdown/types.js';
  import type { Placement } from '@chenzy-design/core';
  import type { ButtonType, ButtonTheme, ButtonSize } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    /** 下拉菜单数据项（透传给 Dropdown.items）。 */
    items?: DropdownItem[];
    /** 下拉浮层位置（透传给 Dropdown.position）。 */
    position?: Placement;
    /** 下拉箭头按钮的 aria-label（无文字按钮必填）。 */
    triggerAriaLabel?: string;
    /** 选中下拉项回调。 */
    onSelect?: (key: string | number) => void;
    /** 主按钮点击回调。 */
    onclick?: (e: MouseEvent) => void;
    /** 分裂按钮组语义标签（root aria-label，对齐 Semi）。 */
    ariaLabel?: string;
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 左侧主按钮内容。 */
    children?: Snippet;
    /** 自定义下拉菜单体（替代 items）。 */
    menu?: Snippet;
  }

  let {
    type = 'primary',
    theme = 'solid',
    size = 'default',
    disabled = false,
    loading = false,
    items = [],
    position = 'bottomEnd',
    triggerAriaLabel = '更多操作',
    onSelect,
    onclick,
    ariaLabel,
    class: className,
    style,
    children,
    menu,
  }: Props = $props();
</script>

<div class={['cd-split-button', className].filter(Boolean).join(' ')} {style} role="group" aria-label={ariaLabel}>
  <Button {type} {theme} {size} {disabled} {loading} onclick={(e) => onclick?.(e)}>
    {@render children?.()}
  </Button>
  <!-- 有自定义 menu 时把它作为 children 透传给 Dropdown；
       否则不传 children，让 Dropdown 走内置 items 渲染分支。
       注意：标签体内即便是空 {#if} 也会被 Svelte 收集成 children snippet，
       从而覆盖 items 导致菜单为空，故必须按 menu 是否存在分叉两个调用。 -->
  {#if menu}
    <Dropdown
      trigger="click"
      {items}
      {position}
      {disabled}
      onSelect={(key) => onSelect?.(key)}
    >
      {#snippet triggerContent()}
        <Button {type} {theme} {size} {disabled} ariaLabel={triggerAriaLabel} icon={caret}></Button>
      {/snippet}
      {@render menu()}
    </Dropdown>
  {:else}
    <Dropdown
      trigger="click"
      {items}
      {position}
      {disabled}
      onSelect={(key) => onSelect?.(key)}
    >
      {#snippet triggerContent()}
        <Button {type} {theme} {size} {disabled} ariaLabel={triggerAriaLabel} icon={caret}></Button>
      {/snippet}
    </Dropdown>
  {/if}
</div>

{#snippet caret()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
{/snippet}

<style>
  .cd-split-button {
    display: inline-flex;
    align-items: center;
  }
  /* 拼接：主按钮右侧去圆角、箭头按钮左侧去圆角并叠边。
     外侧圆角读 Semi splitButtonGroup 专属圆角 token。 */
  .cd-split-button :global(.cd-button:first-child) {
    border-start-start-radius: var(--cd-radius-button-splitbuttongroup);
    border-end-start-radius: var(--cd-radius-button-splitbuttongroup);
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .cd-split-button :global(.cd-dropdown) {
    display: inline-flex;
    margin-inline-start: -1px;
  }
  .cd-split-button :global(.cd-dropdown .cd-button) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: var(--cd-radius-button-splitbuttongroup);
    border-end-end-radius: var(--cd-radius-button-splitbuttongroup);
    position: relative;
    /* 中间细分隔线（对齐 Semi 按钮组分割线 token） */
    box-shadow: inset var(--cd-width-button-group-border) 0 0 0 var(--cd-color-button-group-border-default);
  }
  .cd-split-button :global(.cd-dropdown__trigger) {
    display: inline-flex;
  }
</style>
