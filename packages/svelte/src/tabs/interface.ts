import type { Snippet } from 'svelte';

export type TabKey = string | number;
export type TabType = 'line' | 'card' | 'button' | 'slash';
export type TabSize = 'small' | 'medium' | 'large';
export type TabPosition = 'top' | 'left';
/** collapsible：false 不折叠；true 强制折叠收纳；'auto' 自动检测溢出再决定是否折叠。 */
export type Collapsible = boolean | 'auto';

/** 对齐 Semi PlainTab：数据驱动 tabList 项 / 声明式 TabPane 收集的元数据。 */
export interface PlainTab {
  disabled?: boolean;
  /** 标签文字前渲染的图标（对齐 Semi PlainTab.icon）。 */
  icon?: Snippet;
  itemKey: TabKey;
  tab?: string;
  closable?: boolean;
}

export type MoreConfig =
  | number
  | {
      count?: number;
      render?: Snippet;
      dropdownProps?: Record<string, unknown>;
    };

/** dropdownProps 折叠模式下透传下拉参数：start=前箭头下拉，end=后箭头/更多下拉（对齐 Semi）。 */
export interface TabsDropdownProps {
  start?: Record<string, unknown>;
  end?: Record<string, unknown>;
}

export interface TabsProps {
  /** 受控选中标签 key（对齐 Semi activeKey）。 */
  activeKey?: TabKey;
  /** 非受控初始选中 key（对齐 Semi defaultActiveKey）。 */
  defaultActiveKey?: TabKey;
  /** 视觉风格：line 线条 / card 卡片 / button 分段按钮 / slash 斜线（slash 仅横向）。 */
  type?: TabType;
  /** 尺寸档（对齐 Semi）：small / medium / large，默认 large。 */
  size?: TabSize;
  /** 标签栏位置（对齐 Semi）：top 水平 / left 垂直。slash 仅支持 top。 */
  tabPosition?: TabPosition;
  tabList?: PlainTab[];
  closable?: boolean;
  /**
   * 折叠收纳（对齐 Semi）：
   * - false（默认）：不折叠；
   * - true：溢出时显示前/后切换箭头，可滚动查看被裁切标签（仅横向 top 生效）；
   * - 'auto'：自动检测——标签溢出容器时才启用折叠，容器变宽/标签变少能全显时自动退出。
   */
  collapsible?: Collapsible;
  /** 懒渲染：仅当面板激活过才挂载进 DOM（对齐 Semi lazyRender） */
  lazyRender?: boolean;
  /** 使用 TabPane 写法时是否渲染隐藏面板的 DOM 结构（对齐 Semi keepDOM，默认 true） */
  keepDOM?: boolean;
  /**
   * 溢出折叠配置（对齐 Semi more）：把末尾若干标签收进「更多」下拉。
   * 数字时等价于 { count: n }；对象时含 count（收起数量）、
   * render（自定义「更多」触发器 Snippet）、dropdownProps（透传下拉参数）。仅横向生效。
   */
  more?: MoreConfig;
  /** 标签栏末尾「更多」下拉折叠时，折叠箭头位置（scroll 模式中的前/后箭头）。默认 'both'。 */
  arrowPosition?: 'start' | 'end' | 'both';
  /**
   * 自定义前/后折叠箭头（对齐 Semi renderArrow 四参数签名：items/pos/handleArrowClick/defaultNode）。
   * 接收 { type, items, onClick, defaultNode }：type 前/后；items 该端溢出的标签列表；
   * onClick 默认点击行为（滚动到该端首个溢出标签）；defaultNode 内置默认箭头渲染（Snippet，
   * 可在自定义内容基础上再渲染一次默认箭头）。
   */
  renderArrow?: Snippet<
    [{ type: 'start' | 'end'; items: PlainTab[]; onClick: () => void; defaultNode: Snippet }]
  >;
  /** dropdown 折叠模式是否在下拉中展示收起 tabs（默认 true） */
  showRestInDropdown?: boolean;
  /** 折叠模式下透传下拉参数（对齐 Semi）：{ start, end }，分别作用于前箭头/后箭头「更多」下拉。 */
  dropdownProps?: TabsDropdownProps;
  /** 溢出项变化回调，携带当前可见 tab keys */
  onVisibleTabsChange?: (visibleTabKeys: TabKey[]) => void;
  /** 根节点自定义类名（对齐 Semi className）。 */
  class?: string;
  /** 根节点自定义内联样式（对齐 Semi style；string 或 CSSProperties 对象）。 */
  style?: string | Record<string, string>;
  /** 内容区外层样式（string 或 CSSProperties 对象） */
  contentStyle?: string | Record<string, string>;
  /** 标签栏（tab bar 容器 `.cd-tabs-bar`）自定义 class */
  tabBarClassName?: string;
  /** 标签栏（tab bar 容器 `.cd-tabs-bar`）自定义样式（string 或 CSSProperties 对象） */
  tabBarStyle?: string | Record<string, string>;
  /**
   * 可见标签区域自定义样式（string 或 CSSProperties 对象）。
   * scroll 模式作用于滚动视口 `.cd-tabs-nav`；dropdown 模式作用于可见标签容器 `.cd-tabs-list`。
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
   * 标签被点击回调（对齐 Semi onTabClick）。含已选中标签（未必触发 onChange），
   * 在 disabled 拦截前发出，可用于埋点。
   */
  onTabClick?: (key: TabKey, event: MouseEvent) => void;
  /**
   * 自定义整个标签栏的渲染（调用方完全自绘标签栏）。
   * 接收：当前 tab 列表（数据驱动 tabList 或声明式收集结果）、当前激活 key、
   * 切换回调 setActive（受控时仅触发 onChange，不回写 activeKey，红线 #1）。
   * 传入时跳过内置标签栏与溢出处理；面板内容仍按 activeKey 显隐。
   */
  renderTabBar?: Snippet<[PlainTab[], TabKey | undefined, (key: TabKey) => void]>;
  children?: Snippet;
}

/** TabBar 内部子组件 props（对齐 Semi TabBarProps），仅供 Tabs.svelte 内部拼装。 */
export interface TabBarProps {
  activeKey?: TabKey | undefined;
  className?: string | undefined;
  collapsible?: Collapsible | undefined;
  list: PlainTab[];
  onTabClick: (key: TabKey, event: MouseEvent) => void;
  showRestInDropdown?: boolean | undefined;
  size: TabSize;
  style?: string | undefined;
  tabBarExtraContent?: Snippet | undefined;
  tabPosition: TabPosition;
  type: TabType;
  closable?: boolean | undefined;
  deleteTabItem: (key: TabKey, event: MouseEvent) => void;
  onTabKeyDown: (event: KeyboardEvent, itemKey: TabKey, closable: boolean) => void;
  more?: MoreConfig | undefined;
  onVisibleTabsChange?: ((visibleTabKeys: TabKey[]) => void) | undefined;
  visibleTabsStyle?: string | undefined;
  arrowPosition?: 'start' | 'end' | 'both' | undefined;
  renderArrow?: TabsProps['renderArrow'];
  dropdownProps?: TabsDropdownProps | undefined;
  tabId: (key: TabKey) => string;
  panelId: (key: TabKey) => string;
}

export interface TabPaneProps {
  className?: string | undefined;
  children?: Snippet | undefined;
  disabled?: boolean | undefined;
  /** 标签文字前的图标（对齐 Semi PlainTab.icon）。 */
  icon?: Snippet | undefined;
  itemKey: TabKey;
  style?: string | Record<string, string> | undefined;
  tab?: string | undefined;
  closable?: boolean | undefined;
}

/** 对齐 Semi TabContextValue：Tabs 经 Svelte context 向 TabPane 暴露的响应式状态。 */
export interface TabContextValue {
  getActiveKey: () => TabKey | undefined;
  getLazy: () => boolean;
  getKeepDOM: () => boolean;
  getTabPaneMotion: () => boolean;
  getTabPosition: () => TabPosition;
  getPrevActiveKey: () => TabKey | undefined;
  getForceDisableMotion: () => boolean;
  getPanes: () => PlainTab[];
  getTabId: (key: TabKey) => string;
  getPanelId: (key: TabKey) => string;
  /**
   * 纯声明式自动收集：父未传 tabList 时，TabPane 挂载时注册自身标签元数据（按源码顺序）。
   * 返回稳定 id，TabPane 卸载时用它注销；元数据变化时调用 update 同步。
   *
   * 红线 #2：注册/注销/更新均发生在 TabPane 的 mount/unmount/同步 $effect（副作用），
   * 写父级簿记普通数组 + 仅 bump 一个 version $state；父 render 派生只读 version 重建快照，
   * 子 effect 绝不读该快照 → 副作用写 / 渲染读分离，无 effect 自循环。
   */
  registerPane?: (reg: TabPaneRegistration) => number;
  updatePane?: (id: number, reg: TabPaneRegistration) => void;
  unregisterPane?: (id: number) => void;
}

/** 声明式 <Tabs.Pane> 向父 Tabs 注册时上报的标签元数据（推导 tabList 用）。 */
export interface TabPaneRegistration {
  itemKey: TabKey;
  tab: string;
  icon?: Snippet;
  disabled?: boolean;
  closable?: boolean;
}
