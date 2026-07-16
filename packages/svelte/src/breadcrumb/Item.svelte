<!--
  BreadcrumbItem — declarative item for the `<Breadcrumb.Item>` mode of Breadcrumb.
  - 分隔符由父级纯 CSS（:not(:last-child)::after）自动插入，本组件只渲染自身。
  - 最后一项语义（当前页：不可点 + aria-current=page）由父 context 注册顺序派生。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getBreadcrumbContext } from './context.js';

  interface Props {
    href?: string;
    /** 覆盖父级 separator，仅对本项末尾的分隔符生效（声明式 CSS 模式用 --cd-breadcrumb-separator-content 注入） */
    separator?: string;
    /** 禁止链接/按钮行为：渲染为普通 span（不可点击），忽略 href 和 onClick；末项始终 noLink */
    noLink?: boolean;
    /** 项前置图标 snippet */
    icon?: Snippet;
    class?: string;
    children?: Snippet;
    onClick?: (e: MouseEvent) => void;
  }

  let { href, separator, noLink = false, icon, class: className = '', children, onClick }: Props = $props();

  const ctx = getBreadcrumbContext();

  // mount 时按源码顺序注册，unmount 注销；据此由父派生「是否最后一项」。
  let id = $state(-1);
  $effect(() => {
    if (!ctx) return;
    const myId = ctx.register();
    id = myId;
    return () => ctx.unregister(myId);
  });

  // 红线 #2: 纯派生，render 期只读。无 context 时退化为普通链接项。
  const isLast = $derived(ctx ? id !== -1 && ctx.isLast(id) : false);

  const cls = $derived(['cd-breadcrumb__item', className].filter(Boolean).join(' '));
</script>

<!--
  separator prop：传入时以内联 CSS 变量 --cd-breadcrumb-separator-content 覆盖本项分隔符（仅声明式 CSS 模式）。
  noLink：非最后一项也渲染为普通 span（不可点击/键盘激活）；语义上表示该层级无可导航地址。
  icon：前置图标 snippet，渲染在 children 前。
-->
<span
  class={cls}
  style={separator !== undefined ? `--cd-breadcrumb-separator-content: '${separator}'` : undefined}
>
  {#if isLast || noLink}
    <span
      class="cd-breadcrumb__current"
      aria-current={isLast ? 'page' : undefined}
    >
      {#if icon}<span class="cd-breadcrumb__icon">{@render icon()}</span>{/if}{@render children?.()}
    </span>
  {:else if href}
    <a class="cd-breadcrumb__link" {href} onclick={onClick}>
      {#if icon}<span class="cd-breadcrumb__icon">{@render icon()}</span>{/if}{@render children?.()}
    </a>
  {:else}
    <span
      class="cd-breadcrumb__text"
      role="link"
      tabindex="0"
      onclick={onClick}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as unknown as MouseEvent);
        }
      }}
    >{#if icon}<span class="cd-breadcrumb__icon">{@render icon()}</span>{/if}{@render children?.()}</span
    >
  {/if}
</span>
