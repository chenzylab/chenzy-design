<!--
  Tabs — 全量对齐 Semi Design（semi-foundation/tabs）。
  类型 line/card/button/slash（slash 仅横向）；位置 top/left；尺寸 small/medium/large（默认 large）；
  数据驱动 tabList + 声明式 TabPane、roving tabindex + 键盘、closable。
  滚动折叠（collapsible）：标签超出容器主轴时显示前/后滚动箭头（top 横向 scrollLeft、
  left 纵向 scrollTop），激活标签自动滚到可视区；'auto' 自动检测溢出再决定是否折叠；
  几何测量 + ResizeObserver + 滚动操作全部命令式 + cleanup（红线 #3）。renderArrow/arrowPosition
  作用于此。addable：末尾「+」按钮触发 onAdd（红线 #1 受控）。
  溢出收纳（more / overflow='dropdown'）：把放不下的标签收进末尾「更多」下拉（复用 Dropdown），
  离屏测量层命令式测宽 + computeTabOverflow（core 纯函数）算可见/溢出集，激活标签始终保持可见。
  type='button'：分段按钮组样式（选中段填主色浅底）；type='slash'：相邻标签间对角线分割线。
  纯声明式自动收集：未传 tabList 时，从子 <Tabs.Pane> 的 tab/itemKey/disabled/closable
    自动收集推导 tabList（按源码顺序）；TabPane 在 mount/unmount/同步副作用里写父级簿记
    普通数组 + bump version $state，父 render 据 version 重建快照（红线 #2：副作用写 /
    渲染读分离，子 effect 绝不读快照 → 无 effect_update_depth_exceeded 自循环）。
  renderTabBar：Snippet 完全自绘标签栏（接收 tab 列表 + 当前激活 key + 切换回调），
    自定义渲染时跳过内置标签栏/溢出逻辑，面板内容仍按 activeKey 显隐。

  约束：传 tabList 时标签栏数据驱动（与旧版完全一致）；仅当不传 tabList 时才走声明式收集。

  新增 props（本次补全）：
  - tabBarExtraContent：标签栏右侧额外内容 Snippet
  - more：溢出折叠配置（数字或 {count,render,dropdownProps}）
  - arrowPosition：折叠箭头位置（'start'|'end'|'both'，默认 'both'）
  - renderArrow：自定义箭头 Snippet<[{type:'start'|'end', onClick}]>
  - showRestInDropdown：折叠模式是否展示收起 tabs（默认 true）
  - dropdownProps：透传给「更多」Dropdown 的参数
  - onVisibleTabsChange：溢出项变化回调（携带可见 tab keys）
  - contentStyle：内容区外层样式（string | CSSProperties）
  - preventScroll：Tab 聚焦是否阻止滚动
  - tabPaneMotion：面板切换动画（默认 true）
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, computeTabOverflow } from '@chenzy-design/core';
  import { IconClose, IconChevronDown, IconChevronLeft, IconChevronRight, IconPlus } from '@chenzy-design/icons';
  import { setTabsContext, type TabPaneRegistration } from './context.js';
  import { useLocale } from '../locale-provider/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import type { TabItem } from './types.js';

  type TabKey = string | number;
  type TabType = 'line' | 'card' | 'button' | 'slash';
  type TabSize = 'small' | 'medium' | 'large';
  type TabPosition = 'top' | 'left';
  type KeyboardActivation = 'auto' | 'manual';
  type OverflowMode = 'scroll' | 'dropdown';
  /** collapsible：false 不折叠；true 强制折叠收纳；'auto' 自动检测溢出再决定是否折叠。 */
  type Collapsible = boolean | 'auto';

  type MoreConfig = number | {
    count?: number;
    render?: Snippet;
    dropdownProps?: Record<string, unknown>;
  };

  /** dropdownProps 折叠模式下透传下拉参数：start=前箭头下拉，end=后箭头/更多下拉（对齐 Semi）。 */
  interface DropdownPropsPair {
    start?: Record<string, unknown>;
    end?: Record<string, unknown>;
  }

  interface Props {
    value?: TabKey;
    defaultValue?: TabKey;
    /** 视觉风格：line 线条 / card 卡片 / button 分段按钮 / slash 斜线（slash 仅横向）。 */
    type?: TabType;
    /** 尺寸档（对齐 Semi）：small / medium / large，默认 large。 */
    size?: TabSize;
    /** 标签栏位置（对齐 Semi）：top 水平 / left 垂直。slash 仅支持 top。 */
    tabPosition?: TabPosition;
    tabList?: TabItem[];
    closable?: boolean;
    keyboardActivation?: KeyboardActivation;
    /**
     * 横向溢出处理方式：
     * - 'scroll'（默认）：标签超出容器时显示前/后滚动箭头，命令式滚动；
     * - 'dropdown'：把放不下的标签收纳进末尾「更多」下拉，点下拉项跳到对应 tab。
     * 仅 top/bottom 横向标签栏生效；纵向（left/right）始终走滚动。
     */
    overflow?: OverflowMode;
    /**
     * 折叠收纳（对齐 Semi）：
     * - false（默认）：不折叠；
     * - true：强制走 dropdown 收纳（放不下的标签进末尾「更多」下拉，仅横向 top 生效）；
     * - 'auto'：自动检测——标签溢出容器时才启用折叠，容器变宽/标签变少能全显时自动退出。
     */
    collapsible?: Collapsible;
    /** 首次激活后才挂载面板内容 */
    lazy?: boolean;
    /** 激活过的面板切走后保留 DOM（display:none），而非卸载 */
    keepDOM?: boolean;
    /** 标签栏末尾显示「+」按钮，点击触发 onAdd（受控数据，由父组件追加） */
    addable?: boolean;
    /**
     * 溢出折叠配置：数字时等价于 { count: n }；对象时含 count（收起阈值）、
     * render（自定义「更多」触发器 Snippet）、dropdownProps（透传下拉参数）。
     * 仅 overflow='dropdown'（或 collapsible=true）时生效。
     */
    more?: MoreConfig;
    /** 标签栏末尾「更多」下拉折叠时，折叠箭头位置（scroll 模式中的前/后箭头）。默认 'both'。 */
    arrowPosition?: 'start' | 'end' | 'both';
    /** 自定义前/后折叠箭头 Snippet，接收 { type:'start'|'end', onClick:()=>void } */
    renderArrow?: Snippet<[{ type: 'start' | 'end'; onClick: () => void }]>;
    /** dropdown 折叠模式是否在下拉中展示收起 tabs（默认 true） */
    showRestInDropdown?: boolean;
    /** 折叠模式下透传下拉参数（对齐 Semi）：{ start, end }，分别作用于前箭头/后箭头「更多」下拉。 */
    dropdownProps?: DropdownPropsPair;
    /** 溢出项变化回调，携带当前可见 tab keys */
    onVisibleTabsChange?: (visibleTabKeys: TabKey[]) => void;
    /** 内容区外层样式（string 或 CSSProperties 对象） */
    contentStyle?: string | Record<string, string>;
    /** 标签栏（tab bar 容器 `.cd-tabs__bar`）自定义 class */
    tabBarClassName?: string;
    /** 标签栏（tab bar 容器 `.cd-tabs__bar`）自定义样式（string 或 CSSProperties 对象） */
    tabBarStyle?: string | Record<string, string>;
    /**
     * 可见标签区域自定义样式（string 或 CSSProperties 对象）。
     * scroll 模式作用于滚动视口 `.cd-tabs__nav`；dropdown 模式作用于可见标签容器 `.cd-tabs__list`。
     */
    visibleTabsStyle?: string | Record<string, string>;
    /** Tab 聚焦是否阻止页面滚动（默认 false） */
    preventScroll?: boolean;
    /** 面板切换是否启用动画（默认 true） */
    tabPaneMotion?: boolean;
    /** 标签栏右侧额外内容 */
    tabBarExtraContent?: Snippet;
    onChange?: (key: TabKey) => void;
    onTabClose?: (key: TabKey) => void;
    /**
     * 标签被点击回调（spec §4：on:tabClick）。含已选中标签（未必触发 onChange），
     * 在 disabled 拦截前发出，可用于埋点。
     */
    onTabClick?: (key: TabKey, event: MouseEvent) => void;
    /** addable=true 时点击「+」按钮回调（红线 #1：组件内部不改 tabList） */
    onAdd?: () => void;
    /**
     * 自定义整个标签栏的渲染（调用方完全自绘标签栏）。
     * 接收：当前 tab 列表（数据驱动 tabList 或声明式收集结果）、当前激活 key、
     * 切换回调 setActive（受控时仅触发 onChange，不回写 value，红线 #1）。
     * 传入时跳过内置标签栏与溢出处理；面板内容仍按 activeKey 显隐。
     */
    renderTabBar?: Snippet<[TabItem[], TabKey | undefined, (key: TabKey) => void]>;
    children?: Snippet;
  }

  let {
    value,
    defaultValue,
    type = 'line',
    size = 'large',
    tabPosition = 'top',
    tabList: tabListProp,
    closable = false,
    keyboardActivation = 'auto',
    overflow = 'scroll',
    collapsible = false,
    lazy = false,
    keepDOM = false,
    addable = false,
    more,
    arrowPosition = 'both',
    renderArrow,
    showRestInDropdown = true,
    dropdownProps,
    onVisibleTabsChange,
    contentStyle,
    preventScroll = false,
    tabPaneMotion = true,
    tabBarClassName,
    tabBarStyle,
    visibleTabsStyle,
    tabBarExtraContent,
    onChange,
    onTabClose,
    onTabClick,
    onAdd,
    renderTabBar,
    children,
  }: Props = $props();

  const baseId = useId('cd-tabs');
  const loc = useLocale();

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
    // 仅在元数据实际变化时 bump（去重，避免无谓 render）。icon 为 Snippet，按引用比较。
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
  // 重建只读普通数组 paneOrder，绝不在此写任何 $state。
  const collectedTabs = $derived.by<TabItem[]>(() => {
    void paneVersion; // 收集顺序/内容变化触发重建
    return paneOrder.map((p) => ({
      tab: p.tab,
      itemKey: p.itemKey,
      ...(p.icon !== undefined ? { icon: p.icon } : {}),
      ...(p.disabled !== undefined ? { disabled: p.disabled } : {}),
      ...(p.closable !== undefined ? { closable: p.closable } : {}),
    }));
  });

  // 标签栏实际数据源：传 tabList 用之（数据驱动，向后兼容）；否则用声明式收集结果。
  const tabList = $derived<TabItem[]>(usesDeclarativeTabs ? collectedTabs : (tabListProp ?? []));

  // tabPosition：top 为横向（主轴 = inline / scrollLeft）；left 为纵向（scrollTop）。
  // slash 仅支持横向（对齐 Semi：斜线式无垂直模式）——即便传 left 也按横向渲染。
  const isVertical = $derived(tabPosition === 'left' && type !== 'slash');

  // 溢出机制对齐 Semi 的两条独立路径：
  // 1) more（数字或对象）→ dropdown 收纳：把末尾若干标签收进「更多」下拉（Semi 的 more）。
  //    overflow='dropdown' 作为等价便捷开关一并归入。仅横向生效。
  // 2) collapsible（true/'auto'）→ 滚动折叠：前/后切换箭头 + 可滚动视口（Semi 的 collapsible，
  //    renderArrow/arrowPosition 作用于此）。'auto' 与 true 都靠 overflowing 决定箭头是否出现，
  //    容器变宽/标签变少不溢出时箭头自动消失，天然"退出"折叠。仅横向生效。
  const hasMore = $derived(more !== undefined && more !== null);
  const dropdownMode = $derived(!isVertical && (hasMore || overflow === 'dropdown'));
  // 滚动折叠激活：collapsible 开启且非 dropdown 收纳模式（两者互斥，more 优先）。
  const scrollCollapsible = $derived(
    !dropdownMode && !isVertical && (collapsible === true || collapsible === 'auto'),
  );

  // --- 受控 value (红线 #1)：不无条件回写 value，仅 onChange ---
  const isControlled = $derived(value !== undefined);
  // inner 初值：defaultValue 优先，否则数据驱动取首项 key（声明式收集首项需待 pane 注册，
  // 故此处不读 derived tabList，初值可能为 undefined，由 activeKey 派生兜底首个可用标签）。
  let inner = $state<TabKey | undefined>(getInitialValue());

  function getInitialValue(): TabKey | undefined {
    if (defaultValue !== undefined) return defaultValue;
    return tabListProp?.[0]?.itemKey;
  }

  // activeKey 纯派生（红线 #1/#2，render 期只读）：
  // 受控取 value；非受控取 inner，inner 未定（如声明式首帧或被关闭后失效）则兜底首个标签 key。
  const activeKey = $derived<TabKey | undefined>(
    isControlled ? value : (resolveUncontrolledKey()),
  );

  function resolveUncontrolledKey(): TabKey | undefined {
    if (inner !== undefined && tabList.some((t) => t.itemKey === inner)) return inner;
    return tabList[0]?.itemKey;
  }

  function setActive(key: TabKey) {
    if (key === activeKey) return;
    if (!isControlled) inner = key;
    onChange?.(key);
  }

  // 声明式 TabPane 通过 context 读取激活 key 决定显隐（红线 #2：getter，非数组注册）。
  // lazy/keepDOM 也经 context 暴露给 TabPane 决定挂载/保留策略。
  setTabsContext({
    getActiveKey: () => activeKey,
    getLazy: () => lazy,
    getKeepDOM: () => keepDOM,
    getTabId: tabId,
    getPanelId: panelId,
    registerPane,
    updatePane,
    unregisterPane,
  });

  function tabId(key: TabKey): string {
    return `${baseId}-tab-${key}`;
  }
  function panelId(key: TabKey): string {
    return `${baseId}-panel-${key}`;
  }

  function isClosable(item: TabItem): boolean {
    return item.closable ?? closable;
  }

  // 内部激活：仅切换激活态（disabled 拦截），不发 on:tabClick（无原始事件来源）。
  function activateTab(item: TabItem) {
    if (item.disabled) return;
    setActive(item.itemKey);
  }

  // 标签按钮点击：先发 spec §4 on:tabClick（含已选中、disabled 拦截前，可埋点），再激活。
  function handleTabClick(event: MouseEvent, item: TabItem) {
    onTabClick?.(item.itemKey, event);
    activateTab(item);
  }

  function closeTab(e: MouseEvent, item: TabItem) {
    e.stopPropagation();
    if (item.disabled) return;
    onTabClose?.(item.itemKey);
  }

  // --- 键盘导航 (红线 #2)：roving tabindex 仅由 activeKey 决定，不读挂载数组 ---
  // tablist 内移动焦点到相邻未禁用 tab；auto 聚焦即激活，manual 需 Enter/Space。
  function enabledIndexes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < tabList.length; i += 1) {
      if (!tabList[i]?.disabled) out.push(i);
    }
    return out;
  }

  function focusTab(index: number) {
    const item = tabList[index];
    if (!item) return;
    const el = document.getElementById(tabId(item.itemKey));
    el?.focus({ preventScroll });
    if (keyboardActivation === 'auto') setActive(item.itemKey);
  }

  function onTabKeydown(e: KeyboardEvent, item: TabItem) {
    const enabled = enabledIndexes();
    if (enabled.length === 0) return;
    const currentIdx = enabled.indexOf(tabList.indexOf(item));
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabled[(currentIdx + 1) % enabled.length];
        if (next !== undefined) focusTab(next);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prev = enabled[(currentIdx - 1 + enabled.length) % enabled.length];
        if (prev !== undefined) focusTab(prev);
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = enabled[0];
        if (first !== undefined) focusTab(first);
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIdx = enabled[enabled.length - 1];
        if (lastIdx !== undefined) focusTab(lastIdx);
        break;
      }
      case 'Enter':
      case ' ': {
        if (keyboardActivation === 'manual') {
          e.preventDefault();
          setActive(item.itemKey);
        }
        break;
      }
      default:
        break;
    }
  }

  // --- 溢出滚动 (红线 #3)：几何测量/ResizeObserver/滚动操作全部命令式 + cleanup ---
  // navEl = 滚动视口（overflow:hidden，scrollLeft/scrollTop 在其上）；listEl = 内部 role=tablist。
  // 横向比 scrollWidth>clientWidth，纵向比 scrollHeight>clientHeight 判断是否溢出。
  let navEl = $state<HTMLElement | null>(null);
  let listEl = $state<HTMLElement | null>(null);

  // 几何 $state（红线 #2）：仅由命令式 measure() 写入，render 期只读，
  // 绝不在 render/$derived 里读 DOM 几何。
  let overflowing = $state(false); // 是否溢出（决定箭头是否渲染）
  let canScrollPrev = $state(false); // 前向箭头可用态
  let canScrollNext = $state(false); // 后向箭头可用态

  // 普通（非响应式）变量：rAF 句柄。
  let rafId = 0;

  // 每次滚动按钮点击的滚动步长（视口主轴尺寸的 ~80%）。
  const SCROLL_RATIO = 0.8;

  /** 命令式测量：读视口几何 → 写 overflowing / canScrollPrev / canScrollNext $state。 */
  function measure(): void {
    const nav = navEl;
    if (!nav) return;
    let viewport: number;
    let scrollSize: number;
    let scrollPos: number;
    if (isVertical) {
      viewport = nav.clientHeight;
      scrollSize = nav.scrollHeight;
      scrollPos = nav.scrollTop;
    } else {
      viewport = nav.clientWidth;
      scrollSize = nav.scrollWidth;
      scrollPos = nav.scrollLeft;
    }
    // 1px 容差，避免亚像素抖动。
    const over = scrollSize - viewport > 1;
    const prev = over && scrollPos > 1;
    const next = over && scrollPos < scrollSize - viewport - 1;
    if (over !== overflowing) overflowing = over;
    if (prev !== canScrollPrev) canScrollPrev = prev;
    if (next !== canScrollNext) canScrollNext = next;
  }

  function scheduleMeasure(): void {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  }

  /** 命令式滚动一步（dir=-1 前 / 1 后）。 */
  function scrollByStep(dir: -1 | 1): void {
    const nav = navEl;
    if (!nav) return;
    if (isVertical) {
      const step = nav.clientHeight * SCROLL_RATIO * dir;
      nav.scrollTo({ top: nav.scrollTop + step, behavior: 'smooth' });
    } else {
      const step = nav.clientWidth * SCROLL_RATIO * dir;
      nav.scrollTo({ left: nav.scrollLeft + step, behavior: 'smooth' });
    }
    // 滚动后箭头可用态由 scroll 事件回调更新。
  }

  /** 把激活标签命令式滚动到可视区（若不在视口内）。 */
  function scrollActiveIntoView(): void {
    const nav = navEl;
    if (!nav || activeKey === undefined) return;
    const el = document.getElementById(tabId(activeKey));
    if (!el) return;
    if (isVertical) {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const viewTop = nav.scrollTop;
      const viewBottom = viewTop + nav.clientHeight;
      if (top < viewTop) nav.scrollTo({ top, behavior: 'smooth' });
      else if (bottom > viewBottom)
        nav.scrollTo({ top: bottom - nav.clientHeight, behavior: 'smooth' });
    } else {
      const left = el.offsetLeft;
      const right = left + el.offsetWidth;
      const viewLeft = nav.scrollLeft;
      const viewRight = viewLeft + nav.clientWidth;
      if (left < viewLeft) nav.scrollTo({ left, behavior: 'smooth' });
      else if (right > viewRight)
        nav.scrollTo({ left: right - nav.clientWidth, behavior: 'smooth' });
    }
  }

  // ResizeObserver：命令式创建 + observe(navEl) + observe(listEl)，
  // 视口或内容尺寸变 → rAF 合批 measure；nav 滚动事件直接 measure。
  // 不依赖 overflowing/canScroll* $state，故 measure 写它们不会重跑此 effect（零循环）。
  $effect(() => {
    const nav = navEl;
    const list = listEl;
    if (!nav) return;
    measure();
    const ro = new ResizeObserver(() => scheduleMeasure());
    ro.observe(nav);
    if (list) ro.observe(list);
    const onScroll = (): void => measure();
    nav.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      nav.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // tabList 内容变化重测（仅依赖 tabList.length，不依赖几何 $state）。
  $effect(() => {
    void tabList.length;
    scheduleMeasure();
  });

  // 激活 key 变化时把激活标签滚到可视区（仅依赖 activeKey）。
  // 仅滚动模式需要——dropdown 模式由 measureDropdown 保证激活标签留可见。
  $effect(() => {
    void activeKey;
    if (dropdownMode) return;
    requestAnimationFrame(() => scrollActiveIntoView());
  });

  // --- dropdown 收纳 (红线 #2/#3)：与 OverflowList 同构 ---
  // 离屏测量层渲染全部标签 + 「更多」样本，命令式读 offsetWidth → computeTabOverflow，
  // 把可见/溢出索引集写入 $state，render 期只读切片。measure 只由 RO（容器尺寸变）
  // 和 tabList/activeKey 变触发，绝不依赖 visible/overflow $state → 零循环。
  let barEl = $state<HTMLElement | null>(null); // dropdown 模式根（RO 观测对象 + containerSize 源）
  let measureEl = $state<HTMLElement | null>(null); // 离屏测量层

  // 几何 $state：仅由命令式 measureDropdown() 写入，render 期只读。初值全显（首帧降级防闪）。
  let visibleIdx = $state<number[]>([]);
  let overflowIdx = $state<number[]>([]);

  // 普通（非响应式）变量：rAF 句柄 + 上次结果指纹（去重写 $state）。
  let dropRaf = 0;
  let prevVisibleKey = '';
  let prevOverflowKey = '';

  /** 命令式测量（普通函数，绝不 $derived/不依赖 visible/overflow $state）。 */
  function measureDropdown(): void {
    const bar = barEl;
    const root = measureEl;
    if (!bar || !root) return;
    // 容器主轴可用宽：读 bar.clientWidth（block，随父宽变化，已扣 padding）。
    const containerSize = bar.clientWidth;
    const tabNodes = root.querySelectorAll<HTMLElement>('[data-cd-measure-tab]');
    const tabSizes: number[] = [];
    for (const node of tabNodes) tabSizes.push(node.offsetWidth);
    const moreNode = root.querySelector<HTMLElement>('[data-cd-measure-more]');
    const moreSize = moreNode ? moreNode.offsetWidth : 0;
    // gap 与 CSS 实际像素一致：dropdown 模式标签间距。
    const gapPx = size === 'small' ? 0 : size === 'large' ? 4 : 2;
    const activeIndex = activeKey === undefined ? -1 : tabList.findIndex((t) => t.itemKey === activeKey);
    const r = computeTabOverflow({ tabSizes, containerSize, moreSize, gap: gapPx, activeIndex });
    // 仅在结果实际变化时写 $state（写 $state 触发 render，但不回触发 measure）。
    const vKey = r.visibleIndexes.join(',');
    const oKey = r.overflowIndexes.join(',');
    if (vKey !== prevVisibleKey) {
      prevVisibleKey = vKey;
      visibleIdx = r.visibleIndexes;
    }
    if (oKey !== prevOverflowKey) {
      prevOverflowKey = oKey;
      overflowIdx = r.overflowIndexes;
    }
  }

  function scheduleDropMeasure(): void {
    if (dropRaf) cancelAnimationFrame(dropRaf);
    dropRaf = requestAnimationFrame(() => {
      dropRaf = 0;
      measureDropdown();
    });
  }

  // ResizeObserver：dropdown 模式命令式观测 barEl；容器尺寸变 → rAF 合批 measureDropdown。
  // 依赖 barEl + dropdownMode；不依赖 visible/overflow $state → 写它们不重跑此 effect。
  $effect(() => {
    if (!dropdownMode) return;
    const bar = barEl;
    if (!bar) return;
    measureDropdown();
    const ro = new ResizeObserver(() => scheduleDropMeasure());
    ro.observe(bar);
    return () => {
      ro.disconnect();
      if (dropRaf) {
        cancelAnimationFrame(dropRaf);
        dropRaf = 0;
      }
    };
  });

  // tabList 内容 / 激活标签变化 → 重测（仅依赖 tabList.length / activeKey，不依赖几何 $state）。
  $effect(() => {
    if (!dropdownMode) return;
    void tabList.length;
    void activeKey;
    scheduleDropMeasure();
  });

  // 渲染派生（红线 #2）：可见/溢出标签集为纯 $derived，仅依赖 tabList + 索引集，不读 DOM。
  const visibleTabs = $derived(visibleIdx.map((i) => tabList[i]).filter(Boolean) as TabItem[]);
  const overflowTabs = $derived(overflowIdx.map((i) => tabList[i]).filter(Boolean) as TabItem[]);

  // onVisibleTabsChange：dropdown 模式下可见 tabs 变化时回调（仅依赖 visibleTabs，不读 DOM）。
  // 用普通变量存上次指纹，仅在真正变化时发出回调（去重），命令式 $effect，不返回 $derived。
  let prevVisibleTabsKey = '';
  $effect(() => {
    if (!dropdownMode || !onVisibleTabsChange) return;
    const key = visibleTabs.map((t) => t.itemKey).join(',');
    if (key === prevVisibleTabsKey) return;
    prevVisibleTabsKey = key;
    onVisibleTabsChange(visibleTabs.map((t) => t.itemKey));
  });

  // 溢出集中是否含激活标签（决定「更多」触发器高亮）。
  const moreActive = $derived(
    activeKey !== undefined && overflowTabs.some((t) => t.itemKey === activeKey),
  );

  // more 配置解析：支持 number 简写或对象形式
  const moreCount = $derived(
    typeof more === 'number' ? more : (more?.count ?? undefined),
  );
  const moreRender = $derived(
    typeof more === 'object' && more !== null ? more.render : undefined,
  );
  const moreDropdownProps = $derived(
    typeof more === 'object' && more !== null ? (more.dropdownProps ?? {}) : {},
  );
  // dropdownProps 为 { start, end }（对齐 Semi）；「更多」触发器在标签栏末尾（end 位置），
  // 故透传 dropdownProps.end。start 预留给前箭头下拉（scroll 折叠自定义箭头场景）。
  const endDropdownProps = $derived(dropdownProps?.end ?? {});

  // 「更多」按钮是否显示：有溢出 tabs 且 showRestInDropdown=true
  const showMoreDropdown = $derived(overflowTabs.length > 0 && showRestInDropdown);

  // 样式归一：字符串直接用；对象转 CSS 字符串（camelCase → kebab-case）。
  function toStyleString(s: string | Record<string, string> | undefined): string | undefined {
    if (s === undefined) return undefined;
    if (typeof s === 'string') return s;
    return Object.entries(s)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
  }

  const contentStyleStr = $derived(toStyleString(contentStyle));
  const tabBarStyleStr = $derived(toStyleString(tabBarStyle));
  const visibleTabsStyleStr = $derived(toStyleString(visibleTabsStyle));

  function onMoreSelect(key: string | number): void {
    const item = tabList.find((t) => t.itemKey === key);
    // 「更多」下拉项选择无原始 MouseEvent，仅激活（不发 on:tabClick）。
    if (item) activateTab(item);
  }

  // slash 仅横向：即便传 tabPosition=left 也按 top 渲染（对齐 Semi）。
  const effectivePosition = $derived(type === 'slash' ? 'top' : tabPosition);
  const cls = $derived(
    [
      'cd-tabs',
      `cd-tabs--${type}`,
      `cd-tabs--${size}`,
      `cd-tabs--${effectivePosition}`,
      dropdownMode ? 'cd-tabs--dropdown' : '',
      !dropdownMode && overflowing ? 'cd-tabs--scrollable' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 单个标签的渲染片段在 scroll/dropdown 两种模式共用（避免重复模板）。
</script>

<!-- 单个标签片段：scroll/dropdown 两模式共用，保证渲染/键盘/关闭逻辑唯一来源。 -->
{#snippet tabNode(item: TabItem)}
  {@const selected = item.itemKey === activeKey}
  <div
    class="cd-tabs__tab"
    class:cd-tabs__tab--active={selected}
    class:cd-tabs__tab--disabled={item.disabled}
  >
    <button
      type="button"
      class="cd-tabs__tab-btn"
      role="tab"
      id={tabId(item.itemKey)}
      aria-selected={selected}
      aria-controls={panelId(item.itemKey)}
      tabindex={selected ? 0 : -1}
      disabled={item.disabled ?? false}
      onclick={(e) => handleTabClick(e, item)}
      onkeydown={(e) => onTabKeydown(e, item)}
    >
      {#if item.icon}
        <span class="cd-tabs__tab-icon" aria-hidden="true">{@render item.icon()}</span>
      {/if}
      {item.tab}
    </button>
    {#if isClosable(item)}
      <button
        type="button"
        class="cd-tabs__close"
        aria-label={loc().t('Tabs.closeTab', { tab: item.tab })}
        tabindex={selected ? 0 : -1}
        onclick={(e) => closeTab(e, item)}
      >
        <IconClose size="small" aria-hidden="true" />
      </button>
    {/if}
  </div>
{/snippet}

{#snippet addBtn()}
  {#if addable}
    <button
      type="button"
      class="cd-tabs__add"
      aria-label={loc().t('Tabs.add')}
      onclick={() => onAdd?.()}
    >
      <IconPlus size="small" aria-hidden="true" />
    </button>
  {/if}
{/snippet}

<div class={cls} class:cd-tabs--no-motion={!tabPaneMotion}>
  {#if renderTabBar}
    <!-- renderTabBar：调用方完全自绘标签栏；跳过内置标签栏/溢出逻辑，面板内容仍按 activeKey 显隐。 -->
    {@render renderTabBar(tabList, activeKey, setActive)}
  {:else if dropdownMode}
    <!-- dropdown 收纳：只渲染可见标签，溢出标签进末尾「更多」下拉。 -->
    <div class="cd-tabs__bar {tabBarClassName ?? ''}" style={tabBarStyleStr} bind:this={barEl}>
      <div class="cd-tabs__list" role="tablist" aria-orientation="horizontal" style={visibleTabsStyleStr}>
        {#each visibleTabs as item (item.itemKey)}
          {@render tabNode(item)}
        {/each}
      </div>

      {#if showMoreDropdown}
        <div class="cd-tabs__more" class:cd-tabs__more--active={moreActive}>
          <Dropdown trigger="click" {...(moreDropdownProps ?? {})} {...endDropdownProps}>
            {#if moreRender}
              {@render moreRender()}
            {:else}
              <button
                type="button"
                class="cd-tabs__more-btn"
                aria-label={loc().t('Tabs.more')}
                aria-haspopup="menu"
              >
                {loc().t('Tabs.more')}
                <IconChevronDown size="small" aria-hidden="true" />
              </button>
            {/if}
            {#snippet render()}
              <Dropdown.Menu>
                {#each overflowTabs as t (t.itemKey)}
                  <Dropdown.Item
                    key={t.itemKey}
                    disabled={t.disabled}
                    onClick={() => onMoreSelect(t.itemKey)}
                  >
                    {t.tab}
                  </Dropdown.Item>
                {/each}
              </Dropdown.Menu>
            {/snippet}
          </Dropdown>
        </div>
      {/if}

      {@render addBtn()}

      {#if tabBarExtraContent}
        <div class="cd-tabs__extra">{@render tabBarExtraContent()}</div>
      {/if}
    </div>

    <!-- 离屏测量层：渲染全部标签 + 「更多」样本，仅供命令式测宽，不进可视布局/Tab 序。 -->
    <div class="cd-tabs__measure" bind:this={measureEl} aria-hidden="true">
      {#each tabList as item (item.itemKey)}
        <div class="cd-tabs__tab" data-cd-measure-tab>
          <span class="cd-tabs__tab-btn">
            {#if item.icon}
              <span class="cd-tabs__tab-icon" aria-hidden="true">{@render item.icon()}</span>
            {/if}
            {item.tab}
          </span>
          {#if isClosable(item)}<span class="cd-tabs__close" style="width:18px"></span>{/if}
        </div>
      {/each}
      <span class="cd-tabs__more-btn" data-cd-measure-more>
        {loc().t('Tabs.more')}
        <IconChevronDown size="small" aria-hidden="true" />
      </span>
    </div>
  {:else}
    <!-- scroll 模式（默认）：前/后箭头 + 可滚动视口，行为与旧版一致。 -->
    <div class="cd-tabs__bar {tabBarClassName ?? ''}" style={tabBarStyleStr}>
      {#if scrollCollapsible && overflowing && (arrowPosition === 'start' || arrowPosition === 'both')}
        {#if renderArrow}
          {@render renderArrow({ type: 'start', onClick: () => scrollByStep(-1) })}
        {:else}
          <button
            type="button"
            class="cd-tabs__scroll-btn cd-tabs__scroll-btn--prev"
            aria-label={loc().t('Tabs.scrollPrev')}
            disabled={!canScrollPrev}
            tabindex="-1"
            onclick={() => scrollByStep(-1)}
          >
            <IconChevronLeft size="small" aria-hidden="true" />
          </button>
        {/if}
      {/if}

      <div class="cd-tabs__nav" style={visibleTabsStyleStr} bind:this={navEl}>
        <div
          class="cd-tabs__list"
          role="tablist"
          aria-orientation={isVertical ? 'vertical' : 'horizontal'}
          bind:this={listEl}
        >
          {#each tabList as item (item.itemKey)}
            {@render tabNode(item)}
          {/each}
        </div>
      </div>

      {#if scrollCollapsible && overflowing && (arrowPosition === 'end' || arrowPosition === 'both')}
        {#if renderArrow}
          {@render renderArrow({ type: 'end', onClick: () => scrollByStep(1) })}
        {:else}
          <button
            type="button"
            class="cd-tabs__scroll-btn cd-tabs__scroll-btn--next"
            aria-label={loc().t('Tabs.scrollNext')}
            disabled={!canScrollNext}
            tabindex="-1"
            onclick={() => scrollByStep(1)}
          >
            <IconChevronRight size="small" aria-hidden="true" />
          </button>
        {/if}
      {/if}

      {@render addBtn()}

      {#if tabBarExtraContent}
        <div class="cd-tabs__extra">{@render tabBarExtraContent()}</div>
      {/if}
    </div>
  {/if}

  {#if children}
    <div class="cd-tabs__content" style={contentStyleStr}>
      {@render children()}
    </div>
  {/if}
</div>

<style>
  /* 全量对齐 Semi semi-foundation/tabs/tabs.scss；token 名值镜像 variables.scss。
     tabPosition 仅 top/left；type 含 line/card/button/slash（slash 仅横向）。 */
  .cd-tabs {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: relative;
    font-size: var(--cd-font-tabs-tab-fontsize);
  }
  .cd-tabs__bar {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
    white-space: nowrap;
    outline: none;
  }
  .cd-tabs--line .cd-tabs__bar {
    border-block-end: var(--cd-width-tabs-bar-line-border) solid var(--cd-color-tabs-tab-line-border-default);
  }

  /* 滚动视口：裁剪溢出，主轴可滚动；隐藏原生滚动条（滚动由箭头驱动）。 */
  .cd-tabs__nav {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
  }
  .cd-tabs__list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  /* 滚动/折叠箭头 + 新增按钮：不收缩，垂直居中对齐标签栏。 */
  .cd-tabs__scroll-btn,
  .cd-tabs__add {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-tabs-tab-pane-arrow);
    border: none;
    background: transparent;
    color: var(--cd-color-tabs-tab-pane-arrow-text-default);
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs__scroll-btn--prev {
    margin-inline-end: var(--cd-spacing-tabs-overflow-icon-marginright);
  }
  .cd-tabs__scroll-btn--next {
    margin-inline-start: var(--cd-spacing-tabs-overflow-icon-marginleft);
  }
  .cd-tabs__add {
    color: var(--cd-color-tabs-tab-line-text-default);
  }
  .cd-tabs__scroll-btn:hover:not(:disabled) {
    background-color: var(--cd-color-tabs-tab-pane-arrow-bg-hover);
  }
  .cd-tabs__scroll-btn:active:not(:disabled) {
    background-color: var(--cd-color-tabs-tab-pane-arrow-bg-active);
  }
  .cd-tabs__add:hover {
    color: var(--cd-color-tabs-tab-line-text-hover);
  }
  .cd-tabs__scroll-btn:disabled {
    color: var(--cd-color-tabs-tab-pane-arrow-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-tabs__scroll-btn:focus-visible,
  .cd-tabs__add:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  /* --- collapsible/overflow=dropdown：bar 单行 flex，溢出标签收进「更多」--- */
  .cd-tabs--dropdown .cd-tabs__bar {
    position: relative;
    flex-wrap: nowrap;
    min-inline-size: 0;
  }
  .cd-tabs--dropdown .cd-tabs__list {
    flex: 0 1 auto;
    min-inline-size: 0;
    overflow: hidden;
  }
  .cd-tabs__more {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: stretch;
  }
  .cd-tabs__more-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    margin: 0;
    padding: var(--cd-spacing-tabs-bar-line-tab-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx);
    border: none;
    background: transparent;
    color: var(--cd-color-tabs-tab-line-text-default);
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs__more-btn:hover {
    color: var(--cd-color-tabs-tab-line-text-hover);
  }
  .cd-tabs__more--active .cd-tabs__more-btn {
    color: var(--cd-color-tabs-tab-line-selected-text-default);
  }
  .cd-tabs__more-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  /* 离屏测量层：渲染全部标签，不可见、不可点、不进 Tab 序、不参与可视布局。 */
  .cd-tabs__measure {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    visibility: hidden;
    pointer-events: none;
    z-index: -1;
  }

  /* ============================================================
     标签容器与按钮基座
     ============================================================ */
  .cd-tabs__tab {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    position: relative;
    white-space: nowrap;
  }
  .cd-tabs__tab-btn {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: var(--cd-font-tabs-tab-fontweight);
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs__tab--active .cd-tabs__tab-btn {
    font-weight: var(--cd-font-tabs-tab-active-fontweight);
  }
  .cd-tabs__tab-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-tabs__tab--disabled .cd-tabs__tab-btn {
    cursor: not-allowed;
  }

  /* 标签图标：文字前渲染，各态色对齐 Semi。 */
  .cd-tabs__tab-icon {
    display: inline-flex;
    align-items: center;
    margin-inline-end: var(--cd-spacing-tabs-tab-icon-marginright);
    color: var(--cd-color-tabs-tab-icon-default);
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled) .cd-tabs__tab-icon {
    color: var(--cd-color-tabs-tab-icon-hover);
  }
  .cd-tabs__tab:active:not(.cd-tabs__tab--disabled) .cd-tabs__tab-icon {
    color: var(--cd-color-tabs-tab-icon-active);
  }
  .cd-tabs__tab--active .cd-tabs__tab-icon {
    color: var(--cd-color-tabs-tab-selected-icon-default);
  }
  .cd-tabs__tab--disabled .cd-tabs__tab-icon {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }

  /* ============================================================
     type=line 线条式
     ============================================================ */
  .cd-tabs--line .cd-tabs__tab {
    color: var(--cd-color-tabs-tab-line-text-default);
    border-block-end: var(--cd-width-tabs-bar-line-tab-border) solid transparent;
    transition: border-bottom-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--line.cd-tabs--top .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-paddingbottom);
  }
  .cd-tabs--line.cd-tabs--top.cd-tabs--small .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-small-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-small-paddingbottom);
  }
  .cd-tabs--line.cd-tabs--top.cd-tabs--medium .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-medium-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-medium-paddingbottom);
  }
  /* 横向 line：首项去左内边距、相邻右外边距 */
  .cd-tabs--line.cd-tabs--top .cd-tabs__nav .cd-tabs__tab:first-of-type {
    padding-inline-start: 0;
  }
  .cd-tabs--line.cd-tabs--top .cd-tabs__tab:not(:last-of-type) {
    margin-inline-end: var(--cd-spacing-tabs-bar-line-tab-marginright);
  }
  .cd-tabs--line .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled) {
    color: var(--cd-color-tabs-tab-line-text-hover);
    border-block-end-color: var(--cd-color-tabs-tab-line-border-hover);
  }
  .cd-tabs--line .cd-tabs__tab:active:not(.cd-tabs__tab--disabled) {
    color: var(--cd-color-tabs-tab-line-text-active);
    border-block-end-color: var(--cd-color-tabs-tab-line-border-active);
  }
  .cd-tabs--line .cd-tabs__tab--active,
  .cd-tabs--line .cd-tabs__tab--active:hover {
    color: var(--cd-color-tabs-tab-line-selected-text-default);
    border-block-end-color: var(--cd-color-tabs-tab-line-selected-indicator-default);
  }
  .cd-tabs--line .cd-tabs__tab--disabled {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }

  /* ============================================================
     type=card 卡片式
     ============================================================ */
  .cd-tabs--card .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-card-tab-paddingy) var(--cd-spacing-tabs-bar-card-tab-paddingx);
    border: var(--cd-width-tabs-bar-card-border) solid transparent;
    border-block-end: none;
    border-radius: var(--cd-radius-tabs-tab-card);
    color: var(--cd-color-tabs-tab-line-text-default);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--card.cd-tabs--top .cd-tabs__bar {
    position: relative;
  }
  .cd-tabs--card.cd-tabs--top .cd-tabs__bar::after {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    border-block-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-border-default);
  }
  .cd-tabs--card.cd-tabs--top .cd-tabs__tab:not(:last-of-type) {
    margin-inline-end: var(--cd-spacing-tabs-bar-card-tab-marginright);
  }
  .cd-tabs--card .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled) {
    background: var(--cd-color-tabs-tab-card-bg-hover);
  }
  .cd-tabs--card .cd-tabs__tab:active:not(.cd-tabs__tab--disabled) {
    background: var(--cd-color-tabs-tab-card-bg-active);
  }
  .cd-tabs--card.cd-tabs--top .cd-tabs__tab--active,
  .cd-tabs--card.cd-tabs--top .cd-tabs__tab--active:hover {
    padding-block-end: var(--cd-spacing-tabs-bar-card-tab-active-paddingbottom);
    border: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-indicator-default);
    border-block-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-bg-default);
    background: transparent;
  }
  .cd-tabs--card .cd-tabs__tab--disabled {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }

  /* ============================================================
     type=button 分段按钮式
     ============================================================ */
  .cd-tabs--button .cd-tabs__bar {
    border: none;
  }
  .cd-tabs--button .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-button-tab-paddingy) var(--cd-spacing-tabs-bar-button-tab-paddingx);
    border: none;
    border-radius: var(--cd-radius-tabs-tab-button);
    color: var(--cd-color-tabs-tab-button-text-default);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--button.cd-tabs--top .cd-tabs__tab:not(:last-of-type) {
    margin-inline-end: var(--cd-spacing-tabs-bar-button-tab-marginright);
  }
  .cd-tabs--button .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled):not(.cd-tabs__tab--active) {
    background-color: var(--cd-color-tabs-tab-button-bg-hover);
  }
  .cd-tabs--button .cd-tabs__tab:active:not(.cd-tabs__tab--disabled):not(.cd-tabs__tab--active) {
    background-color: var(--cd-color-tabs-tab-button-bg-active);
  }
  .cd-tabs--button .cd-tabs__tab--active,
  .cd-tabs--button .cd-tabs__tab--active:hover {
    color: var(--cd-color-tabs-tab-button-selected-text-default);
    background-color: var(--cd-color-tabs-tab-button-selected-bg-default);
  }
  .cd-tabs--button .cd-tabs__tab--disabled {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }

  /* ============================================================
     type=slash 斜线式（仅横向；相邻标签间插对角线分割线）
     ============================================================ */
  .cd-tabs--slash .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-slash-tab-paddingy) var(--cd-spacing-tabs-bar-slash-tab-paddingx);
    color: var(--cd-color-tabs-tab-line-text-default);
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--slash .cd-tabs__tab:first-of-type {
    padding-inline-start: 0;
  }
  .cd-tabs--slash .cd-tabs__tab:not(:last-of-type) {
    margin-inline-end: var(--cd-spacing-tabs-bar-slash-marginright);
  }
  .cd-tabs--slash .cd-tabs__tab:not(:last-of-type)::after {
    content: '';
    display: inline-block;
    margin-inline-start: var(--cd-spacing-tabs-bar-slash-line-marginleft);
    margin-block: var(--cd-spacing-tabs-bar-slash-line-marginy);
    inline-size: var(--cd-width-tabs-tab-slash-line);
    block-size: var(--cd-height-tabs-tab-slash-line);
    vertical-align: bottom;
    background: linear-gradient(
      to bottom right,
      transparent 0%,
      transparent calc(50% - 1px),
      var(--cd-color-tabs-tab-slash-line) 50%,
      transparent calc(50% + 1px),
      transparent 100%
    );
  }
  .cd-tabs--slash .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled) {
    color: var(--cd-color-tabs-tab-line-text-hover);
  }
  .cd-tabs--slash .cd-tabs__tab--active,
  .cd-tabs--slash .cd-tabs__tab--active:hover {
    color: var(--cd-color-tabs-tab-line-selected-text-default);
  }
  .cd-tabs--slash .cd-tabs__tab--disabled {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }

  /* ============================================================
     tabPosition=left（竖向标签栏）
     ============================================================ */
  .cd-tabs--left {
    flex-direction: row;
  }
  .cd-tabs--left .cd-tabs__bar {
    flex-direction: column;
    align-items: stretch;
    /* 纵向滚动需要可约束的高度：随内容/父容器，溢出时由 nav 裁剪滚动。 */
    max-block-size: 100%;
  }
  .cd-tabs--left .cd-tabs__nav {
    flex: 1 1 auto;
    min-block-size: 0;
    min-inline-size: 0;
  }
  .cd-tabs--left .cd-tabs__list {
    flex-direction: column;
    align-items: stretch;
  }
  .cd-tabs--left .cd-tabs__tab-btn {
    inline-size: 100%;
    text-align: start;
  }
  /* 竖向 line */
  .cd-tabs--left.cd-tabs--line .cd-tabs__bar {
    border-block-end: none;
    border-inline-end: var(--cd-width-tabs-bar-line-border) solid var(--cd-color-tabs-tab-line-border-default);
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-padding);
    border-block-end: none;
    border-inline-end: var(--cd-width-tabs-bar-line-tab-border) solid transparent;
  }
  .cd-tabs--left.cd-tabs--line.cd-tabs--small .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-small-padding);
  }
  .cd-tabs--left.cd-tabs--line.cd-tabs--medium .cd-tabs__tab {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-medium-padding);
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab:hover:not(.cd-tabs__tab--disabled) {
    border-inline-end-color: var(--cd-color-tabs-tab-line-border-hover);
    background-color: var(--cd-color-tabs-tab-line-vertical-bg-hover);
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab:active:not(.cd-tabs__tab--disabled) {
    border-inline-end-color: var(--cd-color-tabs-tab-line-border-active);
    background-color: var(--cd-color-tabs-tab-line-vertical-bg-active);
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab--active,
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab--active:hover {
    border-inline-end-color: var(--cd-color-tabs-tab-line-selected-indicator-default);
    background-color: var(--cd-color-tabs-tab-line-vertical-selected-bg-default);
  }
  /* 竖向 card */
  .cd-tabs--left.cd-tabs--card .cd-tabs__bar {
    border-block-end: none;
    border-inline-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-border-default);
  }
  .cd-tabs--left.cd-tabs--card .cd-tabs__tab {
    border-block-end: var(--cd-width-tabs-bar-card-border) solid transparent;
    border-inline-end: none;
    border-radius: var(--cd-radius-tabs-tab-card-left);
  }
  .cd-tabs--left.cd-tabs--card .cd-tabs__tab:not(:last-of-type) {
    margin-block-end: var(--cd-spacing-tabs-bar-card-tab-left-marginbottom);
  }
  .cd-tabs--left.cd-tabs--card .cd-tabs__tab--active,
  .cd-tabs--left.cd-tabs--card .cd-tabs__tab--active:hover {
    border: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-indicator-default);
    border-inline-end: none;
    background: transparent;
  }
  /* 竖向 button */
  .cd-tabs--left.cd-tabs--button .cd-tabs__tab:not(:last-of-type) {
    margin-block-end: var(--cd-spacing-tabs-bar-button-tab-marginbottom);
  }

  /* ============================================================
     内容区 / 面板 / 关闭叉 / 附加操作
     ============================================================ */
  .cd-tabs__content {
    inline-size: 100%;
    padding: var(--cd-spacing-tabs-content-paddingy) var(--cd-spacing-tabs-content-paddingx);
    color: var(--cd-color-tabs-tab-pane-text-default);
  }
  .cd-tabs--left .cd-tabs__content {
    flex: 1 1 auto;
    block-size: 100%;
    padding: 0 var(--cd-spacing-tabs-content-left-paddingx);
  }
  .cd-tabs__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: 10px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-tabs-tab-icon-default);
    cursor: pointer;
  }
  .cd-tabs__close:hover {
    color: var(--cd-color-tabs-tab-line-text-hover);
  }
  .cd-tabs__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  /* tabBarExtraContent：标签栏右侧额外内容，靠右对齐 */
  .cd-tabs__extra {
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: var(--cd-spacing-tabs-bar-extra-paddingy) var(--cd-spacing-tabs-bar-extra-paddingx);
  }
  /* tabPaneMotion=false：禁用面板切换过渡动画 */
  .cd-tabs--no-motion .cd-tabs__content {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tabs__tab,
    .cd-tabs__tab-btn,
    .cd-tabs__tab-icon {
      transition: none;
    }
  }
</style>
