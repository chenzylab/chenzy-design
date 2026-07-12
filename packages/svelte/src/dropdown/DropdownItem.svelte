<!--
  Dropdown.Item — 单个下拉菜单项（对齐 Semi dropdownItem）。
  DOM 镜像 Semi：li[role=menuitem][tabindex=-1][aria-disabled] > (tick?) (icon?) children。
   - showTick（经 context）：active 时左侧显示对勾 IconTick，否则占位透明勾（恒定宽度）。
   - type：primary/secondary/tertiary/warning/danger 语义色。
   - active：字重加粗 + 选中色。
   - 事件：onClick / onMouseEnter / onMouseLeave / onContextMenu。
     嵌套（context.level>1）时 onClick 改用 mousedown（button 0）语义——对齐 Semi：避免外层
     Dropdown 的 outside-click 在 click 前先关闭浮层导致点击丢失。
   - 点击后经 context.requestClose 请求父 Dropdown 关闭（clickToHide）。
-->
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';
  import type { DropdownItemType, DropdownKey } from './types.js';

  interface Props {
    /** 项键，选中回调携带。 */
    key?: DropdownKey | undefined;
    /** 是否禁用菜单项（对齐 Semi disabled）。 */
    disabled?: boolean | undefined;
    /** 激活态：showTick 时左侧显示对勾、字重加粗、颜色加深（对齐 Semi active）。 */
    active?: boolean | undefined;
    /** 语义色（对齐 Semi type）。 */
    type?: DropdownItemType | undefined;
    /** 前置图标（对齐 Semi icon）。 */
    icon?: Snippet | undefined;
    /** 样式类名（对齐 Semi className）。 */
    class?: string | undefined;
    /** 内联样式（对齐 Semi style）。 */
    style?: string | undefined;
    /** 单击回调（对齐 Semi onClick）。 */
    onClick?: ((e: MouseEvent) => void) | undefined;
    /** MouseEnter 回调（对齐 Semi onMouseEnter）。 */
    onMouseEnter?: ((e: MouseEvent) => void) | undefined;
    /** MouseLeave 回调（对齐 Semi onMouseLeave）。 */
    onMouseLeave?: ((e: MouseEvent) => void) | undefined;
    /** 右键回调（对齐 Semi onContextMenu）。 */
    onContextMenu?: ((e: MouseEvent) => void) | undefined;
    children?: Snippet | undefined;
  }

  let {
    key,
    disabled = false,
    active = false,
    type,
    icon,
    class: className,
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    children,
  }: Props = $props();

  const ctx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);
  const showTick = $derived(ctx?.showTick ?? false);
  // 嵌套：context.level>1 表示处于子 Dropdown 浮层内（顶层 content 内 level=1）。
  const isNested = $derived((ctx?.level ?? 1) > 1);

  function handleClick(e: MouseEvent) {
    if (disabled) return;
    onClick?.(e);
    ctx?.requestClose?.();
  }

  // 嵌套项用 mousedown（button 0）替代 click（对齐 Semi），避免外层浮层先被 outside-click 关闭。
  function handleMouseDown(e: MouseEvent) {
    if (disabled || !isNested) return;
    if (e.button !== 0) return;
    onClick?.(e);
    ctx?.requestClose?.();
  }

  const itemCls = $derived(
    [
      'cd-dropdown-item',
      disabled && 'cd-dropdown-item-disabled',
      showTick && 'cd-dropdown-item-withTick',
      type && `cd-dropdown-item-${type}`,
      active && 'cd-dropdown-item-active',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!--
  菜单项键盘由父 Dropdown 的 roving 焦点管理（tabindex=-1 + 方向键移动焦点、Enter/Space 由菜单层
  document.activeElement.click() 激活），li 自身不挂 keydown，符合 ARIA menu 模式，故忽略下列 a11y 提示。
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<li
  class={itemCls}
  {style}
  role="menuitem"
  tabindex="-1"
  aria-disabled={disabled || undefined}
  onclick={isNested ? undefined : handleClick}
  onmousedown={isNested ? handleMouseDown : undefined}
  onmouseenter={disabled ? undefined : onMouseEnter}
  onmouseleave={disabled ? undefined : onMouseLeave}
  oncontextmenu={disabled ? undefined : onContextMenu}
>
  {#if showTick}
    <!-- 对勾恒占位：active 显示实色勾，否则透明勾保持宽度一致（对齐 Semi IconTick 占位机制） -->
    <svg
      class="cd-dropdown-item-tick"
      class:cd-dropdown-item-tick--hidden={!active}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      focusable="false"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M9.3 18.2 3 11.9l1.8-1.8 4.5 4.5L19.2 4.7 21 6.5z" />
    </svg>
  {/if}
  {#if icon}
    <span class="cd-dropdown-item-icon">{@render icon()}</span>
  {/if}
  {@render children?.()}
</li>

<style>
  /* 对齐 Semi .semi-dropdown-item */
  .cd-dropdown-item {
    padding: var(--cd-spacing-dropdown-item-paddingy) var(--cd-spacing-dropdown-item-paddingx);
    color: var(--cd-color-dropdown-item-text-default);
    max-width: var(--cd-width-dropdown);
    display: flex;
    align-items: center;
    transition: background-color var(--cd-transition-dropdown-item-bg-duration)
      var(--cd-transition-dropdown-item-bg-function) var(--cd-transition-dropdown-item-bg-delay);
    border-radius: var(--cd-radius-dropdown-item);
    cursor: pointer;
  }
  .cd-dropdown-item:not(.cd-dropdown-item-active):hover {
    background-color: var(--cd-color-dropdown-item-bg-hover);
    cursor: pointer;
  }
  .cd-dropdown-item:not(.cd-dropdown-item-active):active {
    background-color: var(--cd-color-dropdown-item-bg-active);
  }
  .cd-dropdown-item:focus-visible {
    background-color: var(--cd-color-dropdown-item-bg-hover);
    outline: 0;
  }
  /* 对勾（IconTick 等价）：宽度对齐 icon 尺寸 + 右侧留白让位内容 */
  .cd-dropdown-item-tick {
    flex-shrink: 0;
    width: var(--cd-size-dropdown-icon-width);
    height: var(--cd-size-dropdown-icon-height);
    margin-right: var(--cd-spacing-dropdown-icon-marginright);
  }
  .cd-dropdown-item-tick--hidden {
    color: transparent;
  }
  /* icon 容器：对齐 Semi .semi-dropdown-item-icon（inline-flex + margin-right:tight） */
  .cd-dropdown-item-icon {
    display: inline-flex;
    align-items: center;
    margin-right: var(--cd-spacing-tight);
    flex-shrink: 0;
  }
  /* type 语义色 */
  .cd-dropdown-item-danger {
    color: var(--cd-color-dropdown-item-danger-text-default);
  }
  .cd-dropdown-item-secondary {
    color: var(--cd-color-dropdown-item-secondary-text-default);
  }
  .cd-dropdown-item-warning {
    color: var(--cd-color-dropdown-item-warning-text-default);
  }
  .cd-dropdown-item-tertiary {
    color: var(--cd-color-dropdown-item-tertiary-text-default);
  }
  .cd-dropdown-item-primary {
    color: var(--cd-color-dropdown-item-primary-text-default);
  }
  /* showTick：项左内边距让位对勾（对齐 Semi item-withTick-paddingLeft） */
  .cd-dropdown-item-withTick {
    padding-left: var(--cd-spacing-dropdown-item-withtick-paddingleft);
  }
  /* active：字重加粗（对齐 Semi item-active-fontWeight） */
  .cd-dropdown-item-active {
    font-weight: var(--cd-font-dropdown-item-active-fontweight);
  }
  /* 禁用态 */
  .cd-dropdown-item.cd-dropdown-item-disabled {
    color: var(--cd-color-dropdown-item-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-dropdown-item.cd-dropdown-item-disabled:hover,
  .cd-dropdown-item.cd-dropdown-item-disabled:active {
    cursor: not-allowed;
    background-color: var(--cd-color-dropdown-item-disabled-bg-default);
  }
</style>
