<!--
  Nav.Footer — 导航底部（对齐 Semi Footer.tsx）。
  collapseButton 仅 mode='vertical'（非 horizontal）生效，点击经 Nav context toggle 折叠态。
  收起按钮由 NavCollapseButton（复用 Button + Tooltip + IconSidebar）渲染。
  collapseButton 可为 boolean 或 Snippet（自定义节点，对齐 Semi React.isValidElement 分支）。

  双模式：作为 Nav 直接子元素声明式使用时（`<Nav><Nav.Footer>...</Nav.Footer></Nav>`，
  对齐 Semi children 层级 JSX 写法），经 NAV_SLOT_KEY 把自身 props 注册给 Nav、自身不产 DOM，
  由 Nav 在 footer 位置统一渲染（同一份实现）；否则（Nav 内部用 footer prop object 渲染时）
  正常独立渲染自己的 DOM。注册须在 init 期同步完成（对齐 Item/Sub collector 时序约束）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getNavContext, getNavSlotRegistry } from './context.js';
  import NavCollapseButton from './CollapseButton.svelte';

  interface Props {
    /** 是否展示收起按钮，或传自定义节点（仅 vertical 生效）。 */
    collapseButton?: boolean | Snippet;
    /** 收起按钮文案（对齐 Semi collapseText，(collapsed)=>string；默认用 locale）。 */
    collapseText?: (collapsed: boolean) => string;
    /** 自定义类名。 */
    class?: string;
    /** 自定义内联样式。 */
    style?: string;
    /** 点击事件回调（对齐 Semi Nav.Footer onClick）。 */
    onClick?: (e: MouseEvent) => void;
    children?: Snippet;
    /**
     * @internal 仅 Nav.svelte 自身渲染 footer prop object 分支时传 true。
     * Svelte context 沿组件树无条件下发：Nav.svelte 用 setContext 登记 registry 后，
     * 它自己内部渲染的 <NavFooter> 也会读到该 context，须靠此标记显式跳过注册、
     * 强制走独立渲染分支，避免把「Nav 自己画 footer」误判成「用户声明式子元素」。
     */
    _internalRender?: boolean;
  }

  let {
    collapseButton = false,
    collapseText,
    class: className = '',
    style,
    onClick,
    children,
    _internalRender = false,
  }: Props = $props();

  const nav = getNavContext();
  // 声明式子元素为「声明时读取一次」语义（对齐 Nav.Item）：_internalRender 只在 Nav.svelte
  // 内部渲染时静态传 true/不传，不会运行时切换；下方整块（含 slotRegistry 求值与 props
  // 读取）均为刻意一次性静态读取，state_referenced_locally 警告预期且无害。
  // svelte-ignore state_referenced_locally
  const slotRegistry = _internalRender ? undefined : getNavSlotRegistry();
  // svelte-ignore state_referenced_locally
  if (slotRegistry) {
    slotRegistry.setFooter({
      collapseButton,
      ...(collapseText !== undefined ? { collapseText } : {}),
      ...(className !== '' ? { class: className } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(onClick !== undefined ? { onClick } : {}),
      ...(children !== undefined ? { children } : {}),
    });
  }

  // collapseButton 为 Snippet 时视为自定义节点（对齐 Semi isValidElement 分支）。
  const customButton = $derived(
    typeof collapseButton === 'function' ? (collapseButton as Snippet) : undefined,
  );
  const showCollapseButton = $derived(
    !!collapseButton && !children && nav?.mode !== 'horizontal',
  );
  const collapsed = $derived(nav?.collapsed ?? false);
</script>

{#if !slotRegistry}
<div
  class={['cd-nav-footer', className].filter(Boolean).join(' ')}
  class:cd-nav-footer-collapsed={collapsed}
  {style}
  onclick={onClick}
  role="presentation"
>
  {#if children}
    {@render children()}
  {:else if customButton}
    {@render customButton()}
  {:else if showCollapseButton}
    <NavCollapseButton
      isCollapsed={collapsed}
      {...collapseText !== undefined ? { collapseText } : {}}
      onClick={() => nav?.toggleCollapsed()}
    />
  {/if}
</div>
{/if}

<style>
  .cd-nav-footer {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    /* 侧边（vertical）态左右内边距 8px（对齐 Semi $spacing-navigation_vertical_footer-paddingLeft/Right）。 */
    padding: var(--cd-spacing-navigation-footer-paddingy) var(--cd-spacing-navigation-vertical-footer-paddingx);
    color: var(--cd-color-navigation-footer-icon-default);
  }
</style>
