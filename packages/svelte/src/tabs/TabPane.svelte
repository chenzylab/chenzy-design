<!--
  TabPane — 声明式内容面板，对齐 Semi packages/semi-ui/tabs/TabPane.tsx。
  两种用法：
  1) 父传 tabList（数据驱动标签栏）：TabPane 仅提供「内容」，按 context 的 activeKey 决定显隐，
     itemKey 需与对应 tabList 项一致。
  2) 父不传 tabList（纯声明式自动收集）：TabPane 额外把 tab/itemKey/icon/disabled/closable
     注册给父，父据此推导标签栏。注册/注销/同步均在 $effect（mount/unmount/元数据变化），
     向父写普通数组 + bump version（红线 #2：副作用写、render 读分离，绝不在注册 effect 读父快照）。

  切换动画对齐 Semi getDirection：四向 keyframes（leftShow/rightShow/topShow/bottomShow），
  由「当前激活项 vs 上次激活项在 panes 顺序中的相对位置」决定方向；forceDisableMotion
  （新增面板恰好即为激活项时）与非 lazy 首次挂载均不放动画。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { getTabsContext } from './tabs-context.js';
  import type { PlainTab, TabKey, TabPaneRegistration } from './interface.js';

  interface Props {
    itemKey: TabKey;
    tab?: string;
    /** 标签文字前的图标 Snippet（对齐 Semi PlainTab.icon）。 */
    icon?: Snippet;
    disabled?: boolean;
    closable?: boolean;
    class?: string;
    style?: string | Record<string, string>;
    children?: Snippet;
  }

  let { itemKey, tab, icon, disabled, closable, class: className, style, children }: Props = $props();

  const ctx = getTabsContext();
  const activeKey = $derived(ctx?.getActiveKey());
  const active = $derived(activeKey === itemKey);
  const lazy = $derived(ctx?.getLazy() ?? false);
  const keepDOM = $derived(ctx?.getKeepDOM() ?? true);
  const tabPaneMotion = $derived(ctx?.getTabPaneMotion() ?? true);
  const tabPosition = $derived(ctx?.getTabPosition() ?? 'top');
  const forceDisableMotion = $derived(ctx?.getForceDisableMotion() ?? false);
  const panes = $derived(ctx?.getPanes() ?? []);
  const prevActiveKey = $derived(ctx?.getPrevActiveKey());
  // 与 tab 按钮双向关联的稳定 id（aria-controls ↔ id / aria-labelledby）。
  const panelId = $derived(ctx?.getPanelId(itemKey));
  const labelledBy = $derived(ctx?.getTabId(itemKey));

  // 纯声明式自动收集：mount 注册自身标签元数据、unmount 注销；元数据变化时 update 同步。
  // 红线 #2：注册 $effect 只向父写（普通数组 + version bump），绝不读父收集快照 → 无自循环。
  // 注册不依赖挂载与否（lazy 模式面板未挂载也要在标签栏出现），故独立于 shouldMount。
  function buildReg(): TabPaneRegistration {
    return {
      itemKey,
      tab: tab ?? String(itemKey),
      ...(icon !== undefined ? { icon } : {}),
      ...(disabled !== undefined ? { disabled } : {}),
      ...(closable !== undefined ? { closable } : {}),
    };
  }

  let paneId = $state(-1);
  $effect(() => {
    const reg = ctx?.registerPane;
    if (!reg) return;
    const id = untrack(() => reg(buildReg()));
    paneId = id;
    return () => ctx?.unregisterPane?.(id);
  });
  $effect(() => {
    if (paneId === -1) return;
    ctx?.updatePane?.(paneId, buildReg());
  });

  // 记录是否曾激活过（红线 #2：本地 $state 在 effect 内写，不在 render 期写）。
  let everActive = $state(false);
  $effect(() => {
    if (active) everActive = true;
  });

  // 渲染策略（对齐 Semi shouldRender / keepDOM）：
  // - keepDOM（默认 true）：始终挂载所有面板；lazyRender 时首次激活前不渲染 children。
  // - !keepDOM：仅渲染当前激活面板（切走即卸载）。
  const mounted = $derived(keepDOM || active);
  const shouldRenderChildren = $derived(lazy ? everActive : true);

  // 对齐 Semi getDirection：当前 itemKey 相对 activeKey 在 panes 顺序中的位置关系，
  // 决定该面板进入时的滑入方向。
  function getDirection(): boolean {
    if (itemKey === null || activeKey === undefined || !panes.length) return false;
    const activeIndex = panes.findIndex((p) => p.itemKey === activeKey);
    const itemIndex = panes.findIndex((p) => p.itemKey === itemKey);
    const lastActiveIndex = panes.findIndex((p) => p.itemKey === prevActiveKey);
    if (activeIndex === itemIndex) return lastActiveIndex > activeIndex;
    return itemIndex < activeIndex;
  }

  const startClass = $derived.by((): string => {
    const direction = getDirection();
    if (tabPosition === 'top') {
      return direction ? 'cd-tabs-pane-animate-rightShow' : 'cd-tabs-pane-animate-leftShow';
    }
    return direction ? 'cd-tabs-pane-animate-bottomShow' : 'cd-tabs-pane-animate-topShow';
  });

  const isActivatedBecauseOtherRemoved = $derived(!panes.find((p: PlainTab) => p.itemKey === prevActiveKey));
  const hasMotion = $derived(tabPaneMotion && active && !isActivatedBecauseOtherRemoved && !forceDisableMotion);

  // 动画结束后移除动画 class，避免常驻 animation 干扰后续切换（命令式，非 render 期写）。
  let animating = $state(false);
  $effect(() => {
    if (hasMotion) animating = true;
  });
  function onAnimationEnd(): void {
    animating = false;
  }

  const cls = $derived(
    [className ?? '', !active ? 'cd-tabs-pane-inactive' : 'cd-tabs-pane-active', 'cd-tabs-pane']
      .filter(Boolean)
      .join(' '),
  );
  const overlayCls = $derived(
    ['cd-tabs-pane-motion-overlay', hasMotion && animating ? startClass : ''].filter(Boolean).join(' '),
  );

  function toStyleString(s: string | Record<string, string> | undefined): string | undefined {
    if (s === undefined) return undefined;
    if (typeof s === 'string') return s;
    return Object.entries(s)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
  }
  const styleStr = $derived(toStyleString(style));
</script>

{#if mounted}
  <div
    role="tabpanel"
    id={panelId}
    aria-labelledby={labelledBy}
    class={cls}
    style={styleStr}
    aria-hidden={active ? 'false' : 'true'}
    tabindex="0"
  >
    <div class={overlayCls} onanimationend={onAnimationEnd}>
      {#if shouldRenderChildren}{@render children?.()}{/if}
    </div>
  </div>
{/if}

<style>
  .cd-tabs-pane {
    inline-size: 100%;
    overflow: hidden;
    color: var(--cd-color-tabs-tab-pane-text-default);
  }
  .cd-tabs-pane:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tabs-pane-inactive {
    display: none;
  }
  .cd-tabs-pane-motion-overlay {
    inline-size: 100%;
  }

  @keyframes cd-tabs-panel-keyframe-leftShow {
    0% {
      transform: translateX(var(--cd-motion-translate-tabs-pane-left-show));
      opacity: var(--cd-motion-opacity-tabs-pane-show-from);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes cd-tabs-panel-keyframe-rightShow {
    0% {
      transform: translateX(var(--cd-motion-translate-tabs-pane-right-show));
      opacity: var(--cd-motion-opacity-tabs-pane-show-from);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes cd-tabs-panel-keyframe-topShow {
    0% {
      transform: translateY(var(--cd-motion-translate-tabs-pane-left-show));
      opacity: var(--cd-motion-opacity-tabs-pane-show-from);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes cd-tabs-panel-keyframe-bottomShow {
    0% {
      transform: translateY(var(--cd-motion-translate-tabs-pane-right-show));
      opacity: var(--cd-motion-opacity-tabs-pane-show-from);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .cd-tabs-pane-animate-leftShow {
    animation: var(--cd-motion-duration-tabs-pane-show) cd-tabs-panel-keyframe-leftShow var(--cd-motion-ease-tabs-pane-show);
    animation-fill-mode: forwards;
  }
  .cd-tabs-pane-animate-rightShow {
    animation: var(--cd-motion-duration-tabs-pane-show) cd-tabs-panel-keyframe-rightShow var(--cd-motion-ease-tabs-pane-show);
    animation-fill-mode: forwards;
  }
  .cd-tabs-pane-animate-topShow {
    animation: var(--cd-motion-duration-tabs-pane-show) cd-tabs-panel-keyframe-topShow var(--cd-motion-ease-tabs-pane-show);
    animation-fill-mode: forwards;
  }
  .cd-tabs-pane-animate-bottomShow {
    animation: var(--cd-motion-duration-tabs-pane-show) cd-tabs-panel-keyframe-bottomShow var(--cd-motion-ease-tabs-pane-show);
    animation-fill-mode: forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tabs-pane-animate-leftShow,
    .cd-tabs-pane-animate-rightShow,
    .cd-tabs-pane-animate-topShow,
    .cd-tabs-pane-animate-bottomShow {
      animation: none;
    }
  }
</style>
