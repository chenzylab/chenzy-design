<!--
  Nav.Header — 导航头部：logo 槽 + 文案（对齐 Semi header={{logo,text}}）。
  折叠态隐藏文案仅留 logo。

  双模式：作为 Nav 直接子元素声明式使用时（`<Nav><Nav.Header>...</Nav.Header></Nav>`，
  对齐 Semi children 层级 JSX 写法），经 NAV_SLOT_KEY 把自身 props 注册给 Nav、自身不产 DOM，
  由 Nav 在 header-list-outer 位置统一渲染（同一份实现，含 mode/collapsedState 下发）；
  否则（Nav 内部用 header prop object 渲染时）正常独立渲染自己的 DOM。
  注册须在 init 期同步完成（对齐 Item/Sub collector 时序约束）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getNavSlotRegistry } from './context.js';

  interface Props {
    /** Logo 节点。 */
    logo?: Snippet;
    /** Logo 文案（字符串或 Snippet）。 */
    text?: string | Snippet;
    /** 链接地址（对齐 Semi）：传入时头部整体包裹一个 `<a>`。 */
    link?: string;
    /** 透传给 `<a>` 的属性（对齐 Semi linkOptions，如 target/rel）。 */
    linkOptions?: Record<string, string>;
    /** 导航方向（由 Nav 透传；决定 header 左右内边距语义）。 */
    mode?: 'vertical' | 'horizontal';
    /** 折叠态（由 Nav 透传；折叠时隐藏文案）。 */
    collapsedState?: boolean;
    /** 自定义类名。 */
    class?: string;
    /** 自定义内联样式。 */
    style?: string;
    children?: Snippet;
    /**
     * @internal 仅 Nav.svelte 自身渲染 header prop object 分支时传 true。
     * Svelte context 沿组件树无条件下发：Nav.svelte 用 setContext 登记 registry 后，
     * 它自己内部渲染的 <NavHeader> 也会读到该 context，须靠此标记显式跳过注册、
     * 强制走独立渲染分支，避免把「Nav 自己画 header」误判成「用户声明式子元素」。
     */
    _internalRender?: boolean;
  }

  let {
    logo,
    text,
    link,
    linkOptions,
    mode = 'vertical',
    collapsedState = false,
    class: className = '',
    style,
    children,
    _internalRender = false,
  }: Props = $props();

  // 声明式子元素为「声明时读取一次」语义（对齐 Nav.Item）：_internalRender 只在 Nav.svelte
  // 内部渲染时静态传 true/不传，不会运行时切换；下方整块（含 slotRegistry 求值与 props
  // 读取）均为刻意一次性静态读取，state_referenced_locally 警告预期且无害。
  // svelte-ignore state_referenced_locally
  const slotRegistry = _internalRender ? undefined : getNavSlotRegistry();
  // svelte-ignore state_referenced_locally
  if (slotRegistry) {
    slotRegistry.setHeader({
      ...(logo !== undefined ? { logo } : {}),
      ...(text !== undefined ? { text } : {}),
      ...(link !== undefined ? { link } : {}),
      ...(linkOptions !== undefined ? { linkOptions } : {}),
      ...(className !== '' ? { class: className } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(children !== undefined ? { children } : {}),
    });
  }
</script>

{#snippet inner()}
  {#if children}
    {@render children()}
  {:else}
    {#if logo}
      <span class="cd-nav-header-logo">{@render logo()}</span>
    {/if}
    {#if text && !collapsedState}
      <span class="cd-nav-header-text"
        >{#if typeof text === 'string'}{text}{:else}{@render text()}{/if}</span
      >
    {/if}
  {/if}
{/snippet}

{#if !slotRegistry}
<div
  class={[
    'cd-nav-header',
    `cd-nav-header-${mode}`,
    collapsedState && 'cd-nav-header-collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ')}
  {style}
>
  {#if link}
    <a class="cd-nav-header-link" href={link} {...linkOptions}>{@render inner()}</a>
  {:else}
    {@render inner()}
  {/if}
</div>
{/if}

<style>
  .cd-nav-header {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-navigation-header-logo-marginright);
    height: var(--cd-height-navigation-horizontal-header);
    flex: 0 0 auto;
    overflow: hidden;
  }
  /* 顶部导航：左右内边距 24px（对齐 Semi $spacing-navigation_horizontal-paddingLeft）。 */
  .cd-nav-header-horizontal {
    padding-inline: var(--cd-spacing-navigation-horizontal-paddingleft);
  }
  /* 侧边导航：左内边距按 Semi 公式派生使 Logo 与折叠态图标居中对齐，右为 tight。 */
  .cd-nav-header-vertical {
    padding-left: var(--cd-spacing-navigation-vertical-header-paddingleft);
    padding-right: var(--cd-spacing-navigation-vertical-header-paddingright);
  }
  /* 侧边折叠态：右内边距归 0（对齐 Semi collapsed-paddingRight）。 */
  .cd-nav-header-vertical.cd-nav-header-collapsed {
    padding-left: var(--cd-spacing-navigation-vertical-header-collapsed-paddingleft);
    padding-right: var(--cd-spacing-navigation-vertical-header-collapsed-paddingright);
  }
  .cd-nav-header-link {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-navigation-header-logo-marginright);
    color: inherit;
    text-decoration: none;
  }
  .cd-nav-header-logo {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .cd-nav-header-text {
    font-size: var(--cd-font-size-navigation-header-text);
    font-weight: var(--cd-font-navigation-header-item-fontweight);
    white-space: nowrap;
    color: var(--cd-color-navigation-header-text-default);
  }
</style>
