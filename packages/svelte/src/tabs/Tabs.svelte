<!--
  Tabs — 全量对齐 Semi Design（严格镜像 packages/semi-ui/tabs/index.tsx + semi-foundation/tabs）。
  文件拆分对齐 Semi 一一对应：Tabs.svelte(index) / TabBar.svelte / TabItem.svelte / TabPane.svelte /
  interface.ts / tabs-context.ts。

  类型 line/card/button/slash（slash 仅横向）；位置 top/left；尺寸 small/medium/large（默认 large）；
  数据驱动 tabList + 声明式 TabPane、roving tabindex + 键盘（含 Backspace/Delete 关闭）、closable。
  折叠收纳两条独立路径见 TabBar：collapsible（滚动折叠，复用 OverflowList scroll 模式）/
  more（末尾若干标签收进「更多」下拉）。

  纯声明式自动收集：未传 tabList 时，从子 <Tabs.Pane> 的 tab/itemKey/disabled/closable
    自动收集推导 tabList（按源码顺序）；TabPane 在 mount/unmount/同步副作用里写父级簿记
    普通数组 + bump version $state，父 render 据 version 重建快照（红线 #2：副作用写 /
    渲染读分离，子 effect 绝不读快照 → 无 effect_update_depth_exceeded 自循环）。
  renderTabBar：Snippet 完全自绘标签栏（接收 tab 列表 + 当前激活 key + 切换回调），
    自定义渲染时跳过内置标签栏/溢出逻辑，面板内容仍按 activeKey 显隐。

  约束：传 tabList 时标签栏数据驱动（与旧版完全一致）；仅当不传 tabList 时才走声明式收集。
-->
<script lang="ts">
  import { useId, resolveDefault } from '@chenzy-design/core';
  import { setTabsContext } from './tabs-context.js';
  import TabBar from './TabBar.svelte';
  import type { PlainTab, TabKey, TabPaneRegistration, TabsProps } from './interface.js';

  let {
    activeKey: activeKeyProp,
    defaultActiveKey,
    type: typeProp,
    size: sizeProp,
    tabPosition: tabPositionProp,
    tabList: tabListProp,
    closable = false,
    collapsible: collapsibleProp,
    lazyRender: lazyRenderProp,
    keepDOM: keepDOMProp,
    more,
    arrowPosition: arrowPositionProp,
    renderArrow,
    showRestInDropdown: showRestInDropdownProp,
    dropdownProps,
    onVisibleTabsChange,
    class: className,
    style,
    contentStyle,
    preventScroll = false,
    tabPaneMotion: tabPaneMotionProp,
    tabBarClassName,
    tabBarStyle,
    visibleTabsStyle,
    tabBarExtraContent,
    onChange,
    onTabClose,
    onTabClick,
    renderTabBar,
    children,
  }: TabsProps = $props();

  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['Tabs'] > 组件内置默认值。
  const collapsible = $derived(resolveDefault(collapsibleProp, 'Tabs', 'collapsible', false));
  const keepDOM = $derived(resolveDefault(keepDOMProp, 'Tabs', 'keepDOM', true));
  const lazyRender = $derived(resolveDefault(lazyRenderProp, 'Tabs', 'lazyRender', false));
  const size = $derived(resolveDefault(sizeProp, 'Tabs', 'size', 'large'));
  const tabPaneMotion = $derived(resolveDefault(tabPaneMotionProp, 'Tabs', 'tabPaneMotion', true));
  const tabPosition = $derived(resolveDefault(tabPositionProp, 'Tabs', 'tabPosition', 'top'));
  const type = $derived(resolveDefault(typeProp, 'Tabs', 'type', 'line'));
  const showRestInDropdown = $derived(resolveDefault(showRestInDropdownProp, 'Tabs', 'showRestInDropdown', true));
  const arrowPosition = $derived(resolveDefault(arrowPositionProp, 'Tabs', 'arrowPosition', 'both'));

  const baseId = useId('cd-tabs');

  // --- 纯声明式自动收集 (红线 #2) ---
  // 仅当父未传 tabList（undefined）时启用：子 <Tabs.Pane> 在 mount/unmount/同步副作用里
  // 注册标签元数据。簿记 `paneOrder` 为普通数组（非 $state），避免在子注册 $effect 内
  // 既「读」又「写」同一 $state 数组（代理 push 读 length 再写元素）形成自循环；render 真正
  // 需要的「收集结果快照」仅由单独的 version $state 触发重建——子 effect 只 bump version，
  // 绝不读快照 → 副作用写 / 渲染读分离，无 effect_update_depth_exceeded。
  const usesDeclarativeTabs = $derived(tabListProp === undefined);

  interface PaneEntry extends TabPaneRegistration {
    id: number;
  }
  let paneNextId = 0;
  const paneOrder: PaneEntry[] = [];
  let paneVersion = $state(0);

  function bumpPaneVersion(): void {
    paneVersion += 1;
  }

  function registerPane(reg: TabPaneRegistration): number {
    const id = paneNextId++;
    paneOrder.push({ id, ...reg });
    bumpPaneVersion();
    return id;
  }
  function updatePane(id: number, reg: TabPaneRegistration): void {
    const entry = paneOrder.find((p) => p.id === id);
    if (!entry) return;
    if (
      entry.itemKey === reg.itemKey &&
      entry.tab === reg.tab &&
      entry.icon === reg.icon &&
      entry.disabled === reg.disabled &&
      entry.closable === reg.closable
    )
      return;
    Object.assign(entry, reg);
    bumpPaneVersion();
  }
  function unregisterPane(id: number): void {
    const i = paneOrder.findIndex((p) => p.id === id);
    if (i !== -1) {
      paneOrder.splice(i, 1);
      bumpPaneVersion();
    }
  }

  // 收集结果快照（纯派生，render 期只读）：仅依赖 version（重建触发器）。
  const collectedTabs = $derived.by<PlainTab[]>(() => {
    void paneVersion;
    return paneOrder.map((p) => ({
      tab: p.tab,
      itemKey: p.itemKey,
      ...(p.icon !== undefined ? { icon: p.icon } : {}),
      ...(p.disabled !== undefined ? { disabled: p.disabled } : {}),
      ...(p.closable !== undefined ? { closable: p.closable } : {}),
    }));
  });

  // 标签栏实际数据源（对齐 Semi getPanes）：传 tabList 用之；否则用声明式收集结果。
  const panes = $derived<PlainTab[]>(usesDeclarativeTabs ? collectedTabs : (tabListProp ?? []));

  // slash 仅横向：即便传 tabPosition=left 也按 top 渲染（对齐 Semi：斜线式无垂直模式）。
  const effectivePosition = $derived(type === 'slash' ? 'top' : tabPosition);

  // --- 受控 activeKey (红线 #1)：不无条件回写 activeKey，仅 onChange ---
  const isControlled = $derived(activeKeyProp !== undefined);
  let inner = $state<TabKey | undefined>(getInitialValue());
  let prevActiveKey = $state<TabKey | undefined>(undefined);
  // 新增面板恰好即为激活项时不放动画（对齐 Semi forceDisableMotion）。
  let forceDisableMotion = $state(false);
  let prevPaneKeysSig = '';

  function getInitialValue(): TabKey | undefined {
    if (defaultActiveKey !== undefined) return defaultActiveKey;
    return tabListProp?.[0]?.itemKey;
  }

  const activeKey = $derived<TabKey | undefined>(isControlled ? activeKeyProp : resolveUncontrolledKey());

  function resolveUncontrolledKey(): TabKey | undefined {
    if (inner !== undefined && panes.some((t) => t.itemKey === inner)) return inner;
    return panes[0]?.itemKey;
  }

  function setActive(key: TabKey): void {
    if (key === activeKey) return;
    if (!isControlled) inner = key;
    onChange?.(key);
  }

  // activeKey 变化时记录 prevActiveKey（对齐 Semi getDerivedStateFromProps prevActiveKey）；
  // 供 TabPane 动画方向判定。
  let lastSeenActiveKey: TabKey | undefined;
  $effect(() => {
    const key = activeKey;
    if (lastSeenActiveKey !== undefined && lastSeenActiveKey !== key) {
      prevActiveKey = lastSeenActiveKey;
    }
    lastSeenActiveKey = key;
  });

  // panes key 序列变化：判定新增面板是否恰好是当前激活项（forceDisableMotion，对齐 Semi）。
  $effect(() => {
    const sig = panes.map((p) => String(p.itemKey)).join(',');
    if (prevPaneKeysSig) {
      const prevKeys = new Set(prevPaneKeysSig.split(','));
      const addedKeys = panes.map((p) => String(p.itemKey)).filter((k) => !prevKeys.has(k));
      forceDisableMotion = activeKey !== undefined && addedKeys.includes(String(activeKey));
    }
    prevPaneKeysSig = sig;
  });

  function tabId(key: TabKey): string {
    return `${baseId}-tab-${key}`;
  }
  function panelId(key: TabKey): string {
    return `${baseId}-panel-${key}`;
  }

  // 声明式 TabPane 通过 context 读取激活 key 决定显隐（红线 #2：getter，非数组注册）。
  setTabsContext({
    getActiveKey: () => activeKey,
    getLazy: () => lazyRender,
    getKeepDOM: () => keepDOM,
    getTabPaneMotion: () => tabPaneMotion,
    getTabPosition: () => effectivePosition,
    getPrevActiveKey: () => prevActiveKey,
    getForceDisableMotion: () => forceDisableMotion,
    getPanes: () => panes,
    getTabId: tabId,
    getPanelId: panelId,
    registerPane,
    updatePane,
    unregisterPane,
  });

  function isClosable(item: PlainTab): boolean {
    return item.closable ?? closable;
  }

  // 标签点击（对齐 Semi handleTabClick）：先发 onTabClick（含已选中标签，disabled 拦截前，
  // 可用于埋点），disabled 拦截，再激活。
  function onTabClickHandler(key: TabKey, event: MouseEvent): void {
    onTabClick?.(key, event);
    const item = panes.find((p) => p.itemKey === key);
    if (item?.disabled) return;
    setActive(key);
  }

  function deleteTabItem(key: TabKey, event: MouseEvent): void {
    event.stopPropagation();
    onTabClose?.(key);
  }

  // --- 键盘导航（对齐 Semi foundation.handleKeyDown）---
  // 方向键仅移动焦点到相邻未禁用 tab（手动激活）；Enter/Space 激活；Home/End 跳首末；
  // Backspace/Delete 关闭当前 tab（closable 时）并把焦点转移到下一个（末项则转前一个）。
  function enabledTabs(): PlainTab[] {
    return panes.filter((p) => !p.disabled);
  }

  function focusTab(item: PlainTab | undefined): void {
    if (!item) return;
    const el = document.getElementById(tabId(item.itemKey));
    el?.focus({ preventScroll });
  }

  // 对齐 Semi determineOrientation：isVertical（tabPosition=left）只响应 Up/Down，
  // 否则只响应 Left/Right——非对应方向键直接不处理（连 preventDefault 都不做）。
  function isForwardKey(key: string): boolean {
    return effectivePosition === 'left' ? key === 'ArrowDown' : key === 'ArrowRight';
  }
  function isBackwardKey(key: string): boolean {
    return effectivePosition === 'left' ? key === 'ArrowUp' : key === 'ArrowLeft';
  }

  function onTabKeyDown(event: KeyboardEvent, itemKey: TabKey, itemClosable: boolean): void {
    const enabled = enabledTabs();
    const currentIdx = enabled.findIndex((p) => p.itemKey === itemKey);
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        if (!isForwardKey(event.key)) break;
        event.preventDefault();
        if (currentIdx === -1 || enabled.length === 0) break;
        focusTab(enabled[(currentIdx + 1) % enabled.length]);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        if (!isBackwardKey(event.key)) break;
        event.preventDefault();
        if (currentIdx === -1 || enabled.length === 0) break;
        focusTab(enabled[(currentIdx - 1 + enabled.length) % enabled.length]);
        break;
      }
      case 'Home': {
        event.preventDefault();
        focusTab(enabled[0]);
        break;
      }
      case 'End': {
        event.preventDefault();
        focusTab(enabled[enabled.length - 1]);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        setActive(itemKey);
        break;
      }
      case 'Backspace':
      case 'Delete': {
        if (!itemClosable) break;
        const allTabs = panes;
        const index = allTabs.findIndex((p) => p.itemKey === itemKey);
        onTabClose?.(itemKey);
        if (allTabs.length !== 1) {
          const nextIndex = index + 1 >= allTabs.length ? index - 1 : index + 1;
          focusTab(allTabs[nextIndex]);
        }
        break;
      }
      default:
        break;
    }
  }

  // --- 内容渲染（对齐 Semi getActiveItem）：keepDOM 时渲染全部 children，
  // 非 keepDOM 时（走 renderTabBar 之外的默认路径）仅保留过滤后的声明式激活面板。
  // tabList 模式下 content 恒为 children（Semi：tabList 存在时不做过滤）。
  const styleStr = $derived(toStyleString(style));
  const contentStyleStr = $derived(toStyleString(contentStyle));
  const tabBarStyleStr = $derived(toStyleString(tabBarStyle));
  const visibleTabsStyleStr = $derived(toStyleString(visibleTabsStyle));

  function toStyleString(s: string | Record<string, string> | undefined): string | undefined {
    if (s === undefined) return undefined;
    if (typeof s === 'string') return s;
    return Object.entries(s)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
  }

  const wrapperCls = $derived(
    [className ?? '', 'cd-tabs', `cd-tabs-${effectivePosition}`].filter(Boolean).join(' '),
  );
  const contentCls = $derived(['cd-tabs-content', `cd-tabs-content-${effectivePosition}`].filter(Boolean).join(' '));
</script>

<div class={wrapperCls} style={styleStr}>
  {#if renderTabBar}
    {@render renderTabBar(panes, activeKey, setActive)}
  {:else}
    <TabBar
      {activeKey}
      className={tabBarClassName}
      {collapsible}
      list={panes}
      onTabClick={onTabClickHandler}
      {showRestInDropdown}
      {size}
      style={tabBarStyleStr}
      {tabBarExtraContent}
      tabPosition={effectivePosition}
      {type}
      {deleteTabItem}
      {onTabKeyDown}
      {more}
      {onVisibleTabsChange}
      visibleTabsStyle={visibleTabsStyleStr}
      {arrowPosition}
      {renderArrow}
      {dropdownProps}
      {tabId}
      {panelId}
    />
  {/if}

  <div class={contentCls} style={contentStyleStr}>
    {@render children?.()}
  </div>
</div>

<style>
  /* 全量对齐 Semi semi-foundation/tabs/tabs.scss；token 名值镜像 variables.scss。 */
  .cd-tabs {
    box-sizing: border-box;
    position: relative;
  }
  .cd-tabs-left {
    display: flex;
    flex-direction: row;
  }
  .cd-tabs-content {
    inline-size: 100%;
    padding: var(--cd-spacing-tabs-content-paddingy) var(--cd-spacing-tabs-content-paddingx);
  }
  .cd-tabs-content-left {
    block-size: 100%;
    padding: var(--cd-spacing-tabs-content-left-paddingy) var(--cd-spacing-tabs-content-left-paddingx);
  }
</style>
