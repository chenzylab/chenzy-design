<!--
  BreadcrumbItem — 声明式 <Breadcrumb.Item>，严格对齐 semi-ui/breadcrumb/item.tsx。

  DOM/class 对齐 Semi render() + renderItem() + renderBreadItem()：
    <span class="cd-breadcrumb-item-wrap" aria-current="page"?>
      <a|span class="cd-breadcrumb-item [cd-breadcrumb-item-active] [cd-breadcrumb-item-link]">
        [icon]
        <span class="cd-breadcrumb-item-title">
          <Typography.Text ellipsis={{showTooltip, pos}} style="max-width:{width}px">…</Typography.Text>
        </span>
      </a|span>
      {separator prop || <span class="cd-breadcrumb-separator">{context.separator}</span>}
    </span>
  aria-current 挂在 wrap（对齐 Semi render() 里 pageLabel 展开在 wrapperCLs 的 span 上，
  不是挂在 item 本体）。tag 判定：active || !hasHref → span；否则 → a（对齐 Semi
  `tag = active || !hasHref ? 'span' : 'a'`，与 class 的 item-link 条件各自独立）。
  active / shouldRenderSeparator 由父 Breadcrumb 通过 context 派生传入（对齐 Semi 由父
  组件 renderList/renderRouteItems 计算后作为 prop 传给 BreadcrumbItem，Item 自身不猜测）。
  内容统一走 Typography.Text 消费 ellipsis（对齐 Semi renderBreadItem 用 Typography.Text，
  非本库早期自造的手搓截断 action）；Svelte children 恒为 Snippet，无法在编译期复刻 Semi
  `typeof children === 'string'` 的运行时分支，故恒定走 Text 路径（无 ellipsis 需求时 Text
  退化为纯文本包裹，视觉等价）。

  icon 为组件引用直传（Component<IconProps>，如 `icon={IconHome}`），非 Snippet：
  Svelte 5 运行时无法可靠区分 Snippet 与裸 Component 引用（两者编译产物均为普通函数，
  Svelte 官方 issue #9903 / #9774 长期开放且核心团队未提供 isSnippet/isComponent 判别
  API），故本组件不做二选一判别，仅支持 Component 引用一种形式（对齐 Semi renderIcon
  用 `React.cloneElement(iconType, {className, size})` 注入 className/size 的语义——
  组件引用直传天然可从外部注入 size prop，比 Snippet 更贴近 Semi 行为）。

  折叠：本组件只负责「是否隐藏自身」（isCollapsed），折叠触发器 DOM 由父 Breadcrumb 通过
  context.renderCollapseTrigger 统一提供并在此处 {@render}（对齐 Semi handleCollapse 在
  父层 template.splice 的语义——折叠触发器只有一份实现，不在 Item 内重复）。

  已知限制（声明式模式，SSR）：isLast（驱动 active/aria-current/tag/shouldRenderSeparator）
  依赖 context 的子项注册协议——子组件 mount 时同步向父注册，父据此推进「当前已注册的最后
  一个 id」。这在浏览器端能收敛到正确结果，但 SSR 是一次性同步渲染整棵树：每个子组件渲染
  自己那一刻，「目前为止注册的最后一个」永远是它自己，导致 SSR 输出里每一项都被判成
  「最后一项」。已核实 Semi 真实实现用 React.Children.toArray(children) 在父组件层面同步
  拿到完整数组算出 idx===length-1，Svelte 的 children:Snippet 没有等价能力（Svelte 官方
  issue #11566「List of children」长期 open、无官方方案；社区库如 Bits UI 对此类需求的
  处理方式是回避——不需要首尾感知的场景用声明式，需要就必须用数据数组遍历）。
  分隔符显隐与 item-active 视觉样式已改用纯 CSS（:not(:last-child) / :last-child 结构
  选择器）规避，与 JS 的 isLast 解耦，SSR/CSR 恒定一致。但 aria-current（HTML 属性）与
  tag（标签名 a/span）无法用 CSS 表达，声明式模式下 SSR 首屏仍会短暂不一致（hydration 后
  修正）——这是 Svelte 架构本身的限制，routes 模式（父组件同步持有数组）不受影响。

  同源限制也影响 renderMore/moreType='popover'：Semi renderMore(restItem) 传入的是
  React.Children.toArray 处理后的已渲染节点数组，父组件天然能拿到；本库 renderMore 签名
  是路由数据对象数组（{route, index}[]），声明式模式下父 Breadcrumb 同样无法取得子组件
  内部的路由数据，restItems 恒为空数组，折叠浮层内容会渲染为空。routes 模式不受影响
  （数据本就在父组件手里）。见 meta.ts renderMore 字段说明。
-->
<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { onDestroy, untrack } from 'svelte';
  import type { IconSize } from '@chenzy-design/icons';
  import Text from '../typography/Text.svelte';
  import { getBreadcrumbContext } from './context.js';

  /** 图标组件统一 props 形状（对齐 @chenzy-design/icons 具名图标，含其索引签名）。 */
  interface IconProps {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    fill?: string;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }

  interface Props {
    href?: string | undefined;
    /** 覆盖父级 separator（对齐 Semi this.props.separator || <span>{context.separator}</span>）。 */
    separator?: string | undefined;
    /** 禁止链接行为：渲染为 span（不可点击），忽略 href。 */
    noLink?: boolean;
    /**
     * 项前置图标：组件引用直传（对齐 Semi icon: ReactNode + renderIcon 注入 className/size），
     * 如 `icon={IconHome}`。非 Snippet 形式（见文件头注释）。
     */
    icon?: Component<IconProps> | undefined;
    class?: string;
    children?: Snippet;
    onClick?: (e: MouseEvent) => void;
    /**
     * 以下四项对齐 Semi：由父组件（Breadcrumb）算好后作为 prop 显式传入
     * （routes 模式，父组件掌握完整 items 数组与 index，直接计算）。
     * 声明式 <Breadcrumb.Item> 模式下不传，改由 context 的 register 协议派生
     * （Svelte 无法像 React 那样对 children 数组做 index 感知的 slice）。
     */
    active?: boolean | undefined;
    shouldRenderSeparator?: boolean | undefined;
    isCollapsed?: boolean | undefined;
    showCollapseTrigger?: boolean | undefined;
  }

  let {
    href,
    separator,
    noLink = false,
    icon,
    class: className = '',
    children,
    onClick,
    active: activeProp,
    shouldRenderSeparator: shouldRenderSeparatorProp,
    isCollapsed: isCollapsedProp,
    showCollapseTrigger: showCollapseTriggerProp,
  }: Props = $props();

  const ctx = getBreadcrumbContext();
  const explicitMode = $derived(activeProp !== undefined);

  // 组件初始化同步阶段（script 顶层）按源码顺序注册，unmount 时用 onDestroy 注销；
  // 据此由父派生「是否最后一项 / 是否渲染分隔符」。若注册改放 $effect，首次同步渲染时
  // 所有子项都还未注册（$effect 在 paint 后才跑），isLast 恒为 false，导致首帧把最后一项
  // 也误渲染成链接态 + 带分隔符，直到 $effect 补跑完才纠正——真实存在过的首帧闪烁 bug。
  // 显式模式（routes）下父组件已给出全部派生值，无需注册。
  let id = $state(-1);
  if (ctx && !untrack(() => explicitMode)) {
    id = ctx.register();
    onDestroy(() => ctx.unregister(id));
  }

  // 红线 #2: 纯派生，render 期只读。无 context 时退化为普通链接项。
  // active 对齐 Semi：由父组件算好的「是否最后一项」传入（Item 自身不猜测）。
  const active = $derived(explicitMode ? (activeProp ?? false) : ctx ? id !== -1 && ctx.isLast(id) : false);
  const isCollapsed = $derived(
    explicitMode ? (isCollapsedProp ?? false) : ctx ? id !== -1 && ctx.isCollapsed(id) : false,
  );
  const showCollapseTrigger = $derived(
    explicitMode
      ? (showCollapseTriggerProp ?? false)
      : ctx
        ? id !== -1 && ctx.showCollapseTriggerAfter(id)
        : false,
  );
  // shouldRenderSeparator 对齐 Semi：父组件按 idx !== items.length - 1 计算传入；
  // 声明式模式退化为「非最后一项」。
  const shouldRenderSeparator = $derived(
    explicitMode ? (shouldRenderSeparatorProp ?? !active) : !active,
  );

  const hasHref = $derived(href !== undefined && href !== null);
  // 对齐 Semi itemCls：item 恒有；item-active 仅 active；item-link 仅 !noLink（各自独立条件）。
  // 声明式模式不拼 item-active class（视觉交给 Breadcrumb.svelte 的
  // .cd-breadcrumb-item-wrap-declarative:last-child CSS 结构选择器接管，理由见下方 tag 注释）。
  const itemCls = $derived(
    [
      'cd-breadcrumb-item',
      explicitMode && active && 'cd-breadcrumb-item-active',
      !noLink && 'cd-breadcrumb-item-link',
    ]
      .filter(Boolean)
      .join(' '),
  );
  // 对齐 Semi tag = active || !hasHref ? 'span' : 'a'。
  // 已知限制：声明式模式下 active 依赖子项注册动态推进，SSR 一次性同步渲染时每项渲染自己
  // 那一刻都会被判成「最后一个已注册的」，导致 SSR 首屏每一项都渲染成不可点击 span +
  // aria-current="page"，直到 hydration 后才修正为正确的末项判断。tag（标签名）与
  // aria-current（HTML 属性）都无法用纯 CSS 表达，这是 Svelte 声明式独立实例化子组件相对
  // React children.toArray 同步遍历的架构性差距（无官方/社区通用方案，见 issue #11566），
  // 与本组件实现无关，不可在此层完全消除；routes 模式无此问题（父组件同步持有数组）。
  const tag = $derived(active || !hasHref ? 'span' : 'a');

  const compact = $derived(ctx?.compact ?? true);
  // 对齐 Semi getTooltipOpt：!showTooltip 时固定 {width:150, ellipsisPos:'end'}（无 opts）；
  // 否则与 defaultOpts 合并（含 autoAdjustOverflow + position:'top'）。
  const tooltipOpt = $derived.by(() => {
    const showTooltip = ctx?.showTooltip;
    if (!showTooltip) {
      return { width: 150, ellipsisPos: 'end' as const, opts: undefined as Record<string, unknown> | undefined };
    }
    const defaultOpts = {
      width: 150,
      ellipsisPos: 'end' as const,
      opts: { autoAdjustOverflow: true, position: 'top' as const },
    };
    if (typeof showTooltip === 'object') {
      const st = showTooltip as { width?: number | string; ellipsisPos?: 'end' | 'middle'; opts?: object };
      return {
        width: st.width ?? defaultOpts.width,
        ellipsisPos: st.ellipsisPos ?? defaultOpts.ellipsisPos,
        opts: { ...defaultOpts.opts, ...st.opts },
      };
    }
    return defaultOpts;
  });

  // -declarative 标记仅供 Breadcrumb.svelte 的 :not(:last-child) 分隔符显隐规则定位
  // （routes 模式的分隔符已由 shouldRenderSeparator 精确 JS 控制，不挂此类避免被 CSS 重复接管）。
  const wrapCls = $derived(
    ['cd-breadcrumb-item-wrap', !explicitMode && 'cd-breadcrumb-item-wrap-declarative', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if isCollapsed}
  <!-- 被 maxItemCount 折叠：自身不渲染（对齐 Semi children.slice）。 -->
{:else}
  <span class={wrapCls} aria-current={active ? 'page' : undefined}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <svelte:element this={tag} class={itemCls} href={tag === 'a' ? href : undefined} onclick={onClick}>
      {#if icon}
        {@const Icon = icon}
        <Icon class="cd-breadcrumb-item-icon" size={compact ? 'small' : 'default'} />
      {/if}
      {#if children}
        <span class="cd-breadcrumb-item-title">
          <Text
            ellipsis={{ showTooltip: tooltipOpt.opts ? { opts: tooltipOpt.opts } : false, pos: tooltipOpt.ellipsisPos }}
            style="max-width:{typeof tooltipOpt.width === 'number' ? `${tooltipOpt.width}px` : tooltipOpt.width}"
            size={compact ? 'small' : 'normal'}
          >{@render children()}</Text>
        </span>
      {/if}
    </svelte:element>
    {#if explicitMode}
      <!-- routes 模式：shouldRenderSeparator 由父组件同步算好传入（无 SSR 时序问题，
           且折叠区间摘除后「最后一个 DOM 子节点」未必是「最后一项」，不能用 CSS :last-child）。 -->
      {#if shouldRenderSeparator}
        {#if separator !== undefined}
          {separator}
        {:else}
          <span class="cd-breadcrumb-separator">{ctx?.separator ?? '/'}</span>
        {/if}
      {/if}
    {:else}
      <!--
        声明式模式：分隔符始终渲染，用纯 CSS `.cd-breadcrumb-item-wrap:not(:last-child)` 控制
        显隐（见 Breadcrumb.svelte 样式：默认 display:none，非末位 wrap 时覆盖为 flex）——
        wrap 是「最后一个渲染出的 DOM 兄弟节点」时天然为最后一项（isCollapsed 的项整体不
        渲染，折叠触发器渲染的是 .cd-breadcrumb-collapse 而非 .cd-breadcrumb-item-wrap，
        真正的末项后面不会再跟任何 wrap 兄弟节点，故 :last-child 判断天然正确）。不再用 JS
        的 shouldRenderSeparator 判断显隐——它依赖 isLast，而 isLast 靠子项注册收集动态推进：
        SSR 一次性同步渲染整棵树时，每个子组件渲染自己那一刻「目前为止注册的最后一个」永远
        是它自己，导致 SSR 输出里每一项都被判成「最后一项」，分隔符在首屏 HTML 里全部消失，
        直到 hydration 完成后才被 JS 修正（真实复现过：加载态持续约 1s 看不到任何分隔符）。
        CSS 判断不依赖任何运行时状态，SSR/CSR 恒定一致。
      -->
      <!-- separator prop 覆盖时，Semi 源码是裸值无包裹（this.props.separator ||
           <span class="separator">…）；此处复用同一 cd-breadcrumb-separator 类包裹，
           换取声明式模式下末项可被 :not(:last-child) 规则统一控制显隐（唯一微小 DOM 差异，
           换取消除 SSR/CSR 分隔符消失的真实 bug 与两套判断分支）。 -->
      <span class="cd-breadcrumb-separator">{separator !== undefined ? separator : (ctx?.separator ?? '/')}</span>
    {/if}
  </span>
  {#if showCollapseTrigger}
    {@render ctx?.renderCollapseTrigger()}
  {/if}
{/if}
