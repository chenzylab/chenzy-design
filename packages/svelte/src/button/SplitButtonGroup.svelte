<!--
  SplitButtonGroup — 分裂按钮：左侧主 Button + 右侧带下拉箭头的小 Button。
  右侧小按钮点击触发 Dropdown（对齐新 Dropdown API：menu prop / render snippet）。
  视觉上两者拼接、中间细分隔；主按钮 type/theme 透传给两侧。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import { Dropdown } from '../dropdown/index.js';
  import type { DropdownMenuItem, DropdownKey } from '../dropdown/types.js';
  import type { Placement } from '@chenzy-design/core';
  import type { ButtonType, ButtonTheme, ButtonSize } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    /** 下拉菜单数据项（透传给 Dropdown 的 menu prop，JSON Array 配置）。 */
    items?: DropdownMenuItem[];
    /** 下拉浮层位置（透传给 Dropdown.position）。 */
    position?: Placement;
    /** 下拉箭头按钮的 aria-label（无文字按钮必填）。 */
    triggerAriaLabel?: string;
    /** 选中下拉项回调（每个 item 的 onClick 内触发，携带其 key）。 */
    onSelect?: (key: DropdownKey) => void;
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
    /** 自定义下拉菜单体（替代 items，作为 Dropdown 的 render snippet，内含 Dropdown.Menu/Item）。 */
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

  // 把 items 映射为 Dropdown 的 menu：为每个 item 注入 onClick，
  // 内部先调用原 onClick（若有），再上抛 onSelect(key)；title/divider 原样透传。
  const dropdownMenu = $derived(
    items.map((m) => {
      if (m.node !== 'item') return m;
      const { onClick, key } = m;
      return {
        ...m,
        onClick: (e: MouseEvent) => {
          onClick?.(e);
          if (key !== undefined) onSelect?.(key);
        },
      };
    }),
  );
</script>

<div class={['cd-split-button', className].filter(Boolean).join(' ')} {style} role="group" aria-label={ariaLabel}>
  <Button {type} {theme} {size} {disabled} {loading} onclick={(e) => onclick?.(e)}>
    {@render children?.()}
  </Button>
  <!-- 有自定义 menu 时把它作为 Dropdown 的 render snippet 透传（内含 Dropdown.Menu/Item）；
       否则走 menu prop（items 映射）。注意：render 存在时 Dropdown 忽略 menu prop，
       故按 menu snippet 是否存在分叉两个调用，避免空 render 覆盖 menu。 -->
  {#if menu}
    <Dropdown trigger="click" {position} render={menu}>
      <Button {type} {theme} {size} {disabled} ariaLabel={triggerAriaLabel} icon={caret}></Button>
    </Dropdown>
  {:else}
    <Dropdown trigger="click" menu={dropdownMenu} {position}>
      <Button {type} {theme} {size} {disabled} ariaLabel={triggerAriaLabel} icon={caret}></Button>
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
  .cd-split-button :global(.cd-dropdown-trigger) {
    display: inline-flex;
    margin-inline-start: -1px;
  }
  .cd-split-button :global(.cd-dropdown-trigger .cd-button) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: var(--cd-radius-button-splitbuttongroup);
    border-end-end-radius: var(--cd-radius-button-splitbuttongroup);
    position: relative;
    /* 中间细分隔线（对齐 Semi 按钮组分割线 token） */
    box-shadow: inset var(--cd-width-button-group-border) 0 0 0 var(--cd-color-button-group-border-default);
  }
</style>
