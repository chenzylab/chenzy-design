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
    class?: string;
    children?: Snippet;
    onClick?: (e: MouseEvent) => void;
  }

  let { href, class: className = '', children, onClick }: Props = $props();

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

<li class={cls}>
  {#if isLast}
    <span class="cd-breadcrumb__current" aria-current="page">{@render children?.()}</span>
  {:else if href}
    <a class="cd-breadcrumb__link" {href} onclick={onClick}>{@render children?.()}</a>
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
      }}>{@render children?.()}</span
    >
  {/if}
</li>
