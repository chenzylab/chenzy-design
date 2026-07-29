<!--
  Nav.Sub — 声明式可展开子导航（对齐 Semi Nav.Sub）。
  注册自身描述符（含空 items 数组）到父收集器，并向 children 提供新的收集器，
  使内嵌的 Nav.Item / Nav.Sub 按 DOM 顺序 push 进自己的 items（普通数组，嵌套树）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext } from 'svelte';
  import { getNavCollector, NAV_COLLECTOR_KEY, type NavCollector } from './context.js';
  import type { NavItemDef, NavKey, NavDropdownProps } from './types.js';

  interface Props {
    /** 子导航唯一标识。 */
    itemKey: NavKey;
    /** 子导航标题文案（字符串或 Snippet）。 */
    text: string | Snippet;
    /** 标题前置图标。 */
    icon?: Snippet;
    /** 是否禁用（默认 false）。 */
    disabled?: boolean;
    /** 是否保留左侧 Icon 占位（对齐 Semi indent）。 */
    indent?: boolean;
    /** 当前项嵌套层级（对齐 Semi level，默认 0）；limitIndent=false 时用于自定义缩进位置。 */
    level?: number;
    /** 子导航最大高度（内联展开动画，对齐 Semi maxHeight，默认 999）。 */
    maxHeight?: number;
    /** 子导航是否展开（对齐 Semi Sub.isOpen）。 */
    isOpen?: boolean;
    /** 透传给该子导航浮层 Dropdown 的属性（对齐 Semi dropdownProps）。 */
    dropdownProps?: NavDropdownProps;
    /** 透传给该子导航浮层 Dropdown 的内联样式（对齐 Semi dropdownStyle）。 */
    dropdownStyle?: string;
    /** 标题鼠标移入回调。 */
    onMouseEnter?: (e: MouseEvent) => void;
    /** 标题鼠标移出回调。 */
    onMouseLeave?: (e: MouseEvent) => void;
    /** 内嵌的 Nav.Item / Nav.Sub。 */
    children?: Snippet;
  }

  let {
    itemKey,
    text,
    icon,
    disabled = false,
    indent,
    level,
    maxHeight = 999,
    isOpen,
    dropdownProps,
    dropdownStyle,
    onMouseEnter,
    onMouseLeave,
    children,
  }: Props = $props();

  const parent = getNavCollector();

  // 自身描述符：items 为普通数组，承接子项注册。
  // 声明式项「声明时读取一次」语义（对齐 Semi），静态读取，警告预期且无害。
  const childItems: NavItemDef[] = [];
  // svelte-ignore state_referenced_locally
  const selfDescriptor: NavItemDef = {
    itemKey,
    text,
    items: childItems,
    disabled,
    maxHeight,
    ...(icon !== undefined ? { icon } : {}),
    ...(indent !== undefined ? { indent } : {}),
    ...(level !== undefined ? { level } : {}),
    ...(isOpen !== undefined ? { isOpen } : {}),
    ...(dropdownProps !== undefined ? { dropdownProps } : {}),
    ...(dropdownStyle !== undefined ? { dropdownStyle } : {}),
    ...(onMouseEnter !== undefined ? { onMouseEnter } : {}),
    ...(onMouseLeave !== undefined ? { onMouseLeave } : {}),
  };

  // init 同步注册到父级（普通数组）。
  if (parent) parent.add(selfDescriptor);

  // 向 children 提供收集器：add 写入自身 childItems；bump 继续上抛父级（合并为一次）。
  const childCollector: NavCollector = {
    add: (item: NavItemDef) => {
      childItems.push(item);
      return item;
    },
    bump: () => parent?.bump(),
  };
  setContext(NAV_COLLECTOR_KEY, childCollector);

  onMount(() => parent?.bump());
</script>

{#if children}{@render children()}{/if}
