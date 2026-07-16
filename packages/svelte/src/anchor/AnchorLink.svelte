<!--
  Anchor.Link — 锚点链接（严格对齐 Semi Anchor.Link / link.tsx）。
  组合式：向父级收集器注册 href 描述符（供 Anchor 做 scroll-spy / childMap），
  并自渲染 DOM（对齐 Semi link.tsx render）：
    div.cd-anchor-link[role=listitem]
      div.cd-anchor-link-title[role=link tabindex][.-active][.-disabled]
        {title | showTooltip 时 Text ellipsis 承载}
      renderChildren（嵌套 Anchor.Link；autoCollapse 时按激活路径条件渲染）

  安全（对齐 Nav）：init 同步注册进【普通数组】childLinks；挂载后【异步】bump 一次，
  脱离挂载 effect 同步栈，避免 Svelte5 读写自循环（effect_update_depth_exceeded）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext } from 'svelte';
  import {
    getAnchorCollector,
    getAnchorContext,
    ANCHOR_COLLECTOR_KEY,
    type AnchorCollector,
  } from './context.js';
  import type { AnchorLinkNode } from './types.js';
  import Text from '../typography/Text.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';
  import { parsePlacement } from '@chenzy-design/core';

  interface Props {
    /** 跳转的链接（对齐 Semi href），形如 '#section-1'；同时作为唯一 key。 */
    href: string;
    /** 文字内容（对齐 Semi title）。 */
    title: string;
    /** 禁用，不响应点击跳转（对齐 Semi disabled，1.20.0）。 */
    disabled?: boolean;
    /** 类名（对齐 Semi className；本库惯例用 class）。 */
    class?: string;
    /** 样式（对齐 Semi style）。 */
    style?: string;
    /** 内嵌的 Anchor.Link（形成嵌套树）。 */
    children?: Snippet;
  }

  let {
    href,
    title,
    disabled = false,
    class: className,
    style,
    children,
  }: Props = $props();

  const parent = getAnchorCollector();
  const ctx = getAnchorContext();

  // 自身描述符：children 为普通数组，承接子链接注册。
  const childLinks: AnchorLinkNode[] = [];
  // 声明式项「声明时读取一次」语义（对齐 Semi）；静态读取，state_referenced_locally 预期无害。
  // svelte-ignore state_referenced_locally
  const selfDescriptor: AnchorLinkNode = {
    href,
    title,
    disabled,
    children: childLinks,
    ...(className !== undefined ? { className } : {}),
    ...(style !== undefined ? { style } : {}),
  };

  // 当前嵌套层级（顶层为 1，对齐 Semi level）。
  const level = parent?.level ?? 1;

  if (parent) parent.add(selfDescriptor);

  // 向 children 提供收集器：add 写入 childLinks；bump 上抛；level+1。
  const childCollector: AnchorCollector = {
    add: (link: AnchorLinkNode) => {
      childLinks.push(link);
      return link;
    },
    bump: () => parent?.bump(),
    level: level + 1,
  };
  setContext(ANCHOR_COLLECTOR_KEY, childCollector);

  onMount(() => parent?.bump());

  // --- 渲染态（读共享上下文，保持反应性）---
  const active = $derived(ctx?.getActiveHref() === href);
  const tip = $derived(ctx?.getTooltip() ?? null);
  const size = $derived(ctx?.getSize() ?? 'default');
  const position = $derived(ctx?.getPosition());
  const tabindex = $derived(ctx?.getLinkTabindex(href, disabled) ?? -1);

  // autoCollapse：children 仅在「本链接激活」或「激活链接是其后代」时渲染（对齐 Semi renderChildren）。
  const showChildren = $derived.by(() => {
    if (!ctx?.getAutoCollapse()) return true;
    const activeHref = ctx.getActiveHref();
    return activeHref === href || ctx.getChildMap()[href]?.has(activeHref) === true;
  });

  // Popover 用 side+align；Tooltip 用整串 position。
  const tooltipProps = $derived<Record<string, unknown>>(
    position ? { position } : {},
  );
  const popoverProps = $derived.by<Record<string, unknown>>(() => {
    if (!position) return {};
    const { side, align } = parsePlacement(position);
    return { position: side, align };
  });

  // 缩进（对齐 Semi paddingLeft: 8 * level）。
  const indentStyle = $derived(`padding-inline-start:${8 * level}px`);

  let titleNode = $state<HTMLElement | null>(null);
  // 注册标题 DOM 供 Anchor 定位滑轨条（激活链接 offsetTop）。
  $effect(() => {
    ctx?.registerTitleNode(href, titleNode);
    return () => ctx?.registerTitleNode(href, null);
  });
</script>

<div class="cd-anchor-link {className ?? ''}" {style} role="listitem">
  <div
    bind:this={titleNode}
    role="link"
    tabindex={tabindex}
    data-anchor-href={href}
    class="cd-anchor-link-title"
    class:cd-anchor-link-title-active={active}
    class:cd-anchor-link-title-disabled={disabled}
    style={indentStyle}
    aria-current={active ? 'location' : undefined}
    aria-disabled={disabled ? 'true' : undefined}
    title={!tip && typeof title === 'string' ? title : undefined}
    onclick={(e) => ctx?.onLinkClick(e, href)}
    onkeydown={(e) => ctx?.onLinkKeydown(e, href)}
    onfocus={() => ctx?.onLinkFocus(href)}
  >
    {#if tip}
      {#if tip.type === 'popover'}
        <Popover content={title} {...tip.opts} {...popoverProps}>
          <Text
            size={size === 'default' ? 'normal' : 'small'}
            type="tertiary"
            ellipsis
            class="cd-anchor-link-tooltip"
          >
            {title}
          </Text>
        </Popover>
      {:else}
        <Tooltip content={title} {...tip.opts} {...tooltipProps}>
          <Text
            size={size === 'default' ? 'normal' : 'small'}
            type="tertiary"
            ellipsis
            class="cd-anchor-link-tooltip"
          >
            {title}
          </Text>
        </Tooltip>
      {/if}
    {:else}
      {title}
    {/if}
  </div>
  {#if children && showChildren}
    <div role="list">{@render children()}</div>
  {/if}
</div>

<style>
  .cd-anchor-link {
    position: relative;
  }
  .cd-anchor-link-title {
    cursor: pointer;
    color: var(--cd-color-anchor-title-text-default);
    padding-top: var(--cd-spacing-anchor-link-title-paddingtop);
    padding-bottom: var(--cd-spacing-anchor-link-title-paddingbottom);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: var(--cd-width-anchor-outline-border-radius);
    background: var(--cd-color-anchor-title-bg-default);
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-anchor-link-title:hover {
    color: var(--cd-color-anchor-title-text-hover);
  }
  .cd-anchor-link-title-active {
    color: var(--cd-color-anchor-title-text-active);
    background: var(--cd-color-anchor-title-bg-active);
  }
  .cd-anchor-link-title-active:hover {
    color: var(--cd-color-anchor-title-active-text-hover);
  }
  .cd-anchor-link-title:focus-visible {
    outline: var(--cd-width-anchor-outline) solid
      var(--cd-color-anchor-title-outline-focus);
    outline-offset: var(--cd-width-anchor-outlineoffset);
  }
  .cd-anchor-link-title-disabled,
  .cd-anchor-link-title-disabled:hover {
    color: var(--cd-color-anchor-title-text-disabled);
    cursor: not-allowed;
  }
  /* showTooltip 承载文字（对齐 Semi .semi-anchor-link-tooltip）：继承默认色，覆盖 Text 默认。 */
  .cd-anchor-link :global(.cd-anchor-link-tooltip) {
    cursor: pointer;
    color: var(--cd-color-anchor-title-text-default);
  }
  .cd-anchor-link-title-active :global(.cd-anchor-link-tooltip) {
    color: var(--cd-color-anchor-title-text-active);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-anchor-link-title {
      transition: none;
    }
  }
</style>
