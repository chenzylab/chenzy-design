<!--
  Dropdown — 向下弹出的菜单，对齐 Semi Design（semi-ui/dropdown）。

  架构对齐：Semi Dropdown 封装 Tooltip 作纯定位层。本库无独立「纯定位组件」，等价 primitive 是
  _floating/use-floating action（Tooltip/Popover 内部亦复用它），故 Dropdown 直接复用同一 use:floating
  定位层自绘浮层 wrapper（只带 shadow/radius/bg，无 padding，DOM 最贴 Semi）。

  DOM 镜像 Semi：触发器 span.cd-dropdown-trigger（aria-haspopup/expanded 附在其上）；浮层
  div.cd-dropdown（wrapper）> div.cd-dropdown-content > (render | menu 生成的 Dropdown.Menu)。
  菜单为 ul.cd-dropdown-menu[role=menu][aria-orientation=vertical]，项为 li.cd-dropdown-item[role=menuitem]。

  触发方式（对齐 Semi TRIGGER_SET）：hover / focus / click / custom / contextMenu。
   - hover：mouseEnterDelay/mouseLeaveDelay 延迟开关；disableFocusListener=false 时聚焦触发器亦开（Semi issue#977）。
   - focus：聚焦触发器开、失焦关。
   - click：点击切换；打开后焦点自动落首个非禁用项（Semi foundation handleVisibleChange）。
   - custom：显隐完全受控（visible + onVisibleChange），不自动响应任何鼠标/键盘。
   - contextMenu：右键 preventDefault + 记录光标 x/y，浮层落点光标（v2.42+）。

  嵌套：与 Semi 一致——用户在 render 内手动嵌套 <Dropdown>（其 children 为 Dropdown.Item 作触发器），
  子 Dropdown 经 context.level 判定嵌套：默认间距用 NESTED_SPACING(2)，嵌套项 click 走 mousedown 语义。

  键盘（对齐 Semi foundation）：触发器 Enter/Space click 打开、ArrowDown 焦点首项、ArrowUp 焦点末项、Esc 关闭；
  菜单内 ArrowDown/Up 漫游、Esc 关闭回触发器。
-->
<script lang="ts">
  import { setContext, getContext, untrack, type Snippet } from 'svelte';
  import { useId, useDismiss, type Placement } from '@chenzy-design/core';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import DropdownMenu from './DropdownMenu.svelte';
  import DropdownItem from './DropdownItem.svelte';
  import DropdownTitle from './DropdownTitle.svelte';
  import DropdownDivider from './DropdownDivider.svelte';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';
  import type { DropdownMenuItem } from './types.js';

  // 触发方式全集（对齐 Semi strings.TRIGGER_SET）
  type Trigger = 'hover' | 'focus' | 'click' | 'custom' | 'contextMenu';

  // 默认间距（对齐 Semi numbers）：顶层 4、嵌套 2。
  const SPACING = 4;
  const NESTED_SPACING = 2;
  // 默认延迟（对齐 Semi：mouseLeaveDelay 默认 DEFAULT_LEAVE_DELAY=100，mouseEnterDelay 默认 50）。
  const DEFAULT_ENTER_DELAY = 50;
  const DEFAULT_LEAVE_DELAY = 100;

  interface Props {
    /** 弹出层内容，由 Dropdown.Menu / Dropdown.Item / Dropdown.Title / Dropdown.Divider 构成（对齐 Semi render）。 */
    render?: Snippet;
    /** 通过 JSON Array 快速配置 Dropdown 内容（对齐 Semi menu）；render 存在时忽略 menu。 */
    menu?: DropdownMenuItem[];
    /** 触发弹出层的 Trigger 元素（对齐 Semi children）。 */
    children?: Snippet;
    /** 触发下拉的行为：hover / focus / click / custom / contextMenu。默认 hover。 */
    trigger?: Trigger;
    /** 是否显示菜单，需配合 trigger='custom' 使用（对齐 Semi visible，受控）。 */
    visible?: boolean;
    /** 非受控初始显隐。 */
    defaultVisible?: boolean;
    /**
     * 弹出菜单的位置（对齐 Semi position）。本库统一用 12 方位 Placement 命名，
     * 语义与 Semi 一一对应（bottomStart≈bottomLeft、rightStart≈rightTop）。默认 bottom。
     */
    position?: Placement;
    /** 弹出层被遮挡时是否自动调整方向（对齐 Semi autoAdjustOverflow）。默认 true。 */
    autoAdjustOverflow?: boolean;
    /** 鼠标移入 Trigger 后延迟显示时间(ms)，仅 hover/focus 生效（对齐 Semi mouseEnterDelay）。 */
    mouseEnterDelay?: number;
    /** 鼠标移出弹出层后延迟消失时间(ms)，仅 hover/focus 生效（对齐 Semi mouseLeaveDelay）。 */
    mouseLeaveDelay?: number;
    /**
     * 弹出层与 Trigger 的距离(px)（对齐 Semi spacing）。嵌套时缺省用 NESTED_SPACING(2)，顶层 SPACING(4)。
     * 传 { x, y } 时按 position 主轴方向取值（上下取 y、左右取 x）。
     */
    spacing?: number | { x: number; y: number };
    /** 弹出层计算溢出时增加的冗余值(px)（对齐 Semi margin，作用同 Tooltip margin）。 */
    margin?: number;
    /** 弹出层 z-index（对齐 Semi zIndex）。默认 1050（Tooltip DEFAULT_Z_INDEX）。 */
    zIndex?: number;
    /** 下拉动画开关（对齐 Semi motion）。默认 true。 */
    motion?: boolean;
    /** 下拉弹层外层样式类名（对齐 Semi className，作用于 div.cd-dropdown）。 */
    className?: string;
    /** 下拉菜单根元素类名（对齐 Semi contentClassName，作用于 div.cd-dropdown-content）。 */
    contentClassName?: string;
    /** 弹出层内联样式（对齐 Semi style，作用于 div.cd-dropdown-content；勿含 position/transform）。 */
    style?: string;
    /** 是否自动在 active 的 Dropdown.Item 左侧展示对勾（对齐 Semi showTick）。默认 false。 */
    showTick?: boolean;
    /** 是否阻止弹出层上的点击事件冒泡（对齐 Semi stopPropagation）。默认 false。 */
    stopPropagation?: boolean;
    /** 在 trigger 或弹出层按 Esc 键是否关闭面板，受控时不生效（对齐 Semi closeOnEsc）。默认 true。 */
    closeOnEsc?: boolean;
    /** 更新该值手动触发弹出层重新定位（对齐 Semi rePosKey）。 */
    rePosKey?: string | number;
    /** hover 时不响应键盘聚焦弹出事件（对齐 Semi disableFocusListener，issue#977）。默认 false。 */
    disableFocusListener?: boolean;
    /** 弹出层内点击时是否自动关闭弹出层（对齐 Semi clickToHide）。默认随触发方式：hover/click 为 true。 */
    clickToHide?: boolean;
    /** 关闭时是否保留内部组件 DOM 不销毁（对齐 Semi keepDOM）。默认 false。 */
    keepDOM?: boolean;
    /** 指定父级 DOM，弹层渲染至该 DOM（对齐 Semi getPopupContainer）。默认 document.body。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 弹出层显示状态改变时的回调（对齐 Semi onVisibleChange）。 */
    onVisibleChange?: (visible: boolean) => void;
    /** 在 trigger 或弹出层按 Esc 键时调用（对齐 Semi onEscKeyDown），在关闭逻辑之前。 */
    onEscKeyDown?: (e: KeyboardEvent) => void;
    /** 展示状态下点击非 children、非弹出层区域时回调（对齐 Semi onClickOutSide，仅 custom/click 有效）。 */
    onClickOutSide?: (e: PointerEvent) => void;
  }

  let {
    render,
    menu,
    children,
    trigger = 'hover',
    visible,
    defaultVisible = false,
    position = 'bottom',
    autoAdjustOverflow = true,
    mouseEnterDelay = DEFAULT_ENTER_DELAY,
    mouseLeaveDelay = DEFAULT_LEAVE_DELAY,
    spacing,
    margin,
    zIndex = 1050,
    motion = true,
    className,
    contentClassName,
    style: contentStyle,
    showTick = false,
    stopPropagation = false,
    closeOnEsc = true,
    rePosKey,
    disableFocusListener = false,
    clickToHide,
    keepDOM = false,
    getPopupContainer,
    onVisibleChange,
    onEscKeyDown,
    onClickOutSide,
  }: Props = $props();

  // 父级 Dropdown 上下文（嵌套判定）：顶层无父 ctx（level 视为 0），render 内的 Item 处于 level 1，
  // 其内的子 Dropdown 读到 parent.level=1，自身内容 level=2。
  const parentCtx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);
  const parentLevel = parentCtx?.level ?? 0;
  const isNested = $derived(parentLevel > 0);

  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，否则继承父级容器（嵌套同容器）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(
    getPopupContainer ?? parentCtx?.getContainer ?? globalPopupContainer,
  );

  const menuId = useId('cd-dropdown-menu');
  const triggerId = useId('cd-dropdown-trigger');

  // spacing → floating 主轴 offset：未传时顶层 SPACING / 嵌套 NESTED_SPACING；
  // number 直用；{ x, y } 按 position 主轴方向取值（上下取 y、左右取 x）。
  const offset = $derived.by(() => {
    const s = spacing ?? (isNested ? NESTED_SPACING : SPACING);
    if (typeof s === 'number') return s;
    const horizontal = position.startsWith('left') || position.startsWith('right');
    return horizontal ? s.x : s.y;
  });

  // 溢出冗余（Semi margin）：透传给 floating padding（视口边缘保留距离）；未传时用默认。
  const DEFAULT_FLOAT_PADDING = 8;
  const floatPadding = $derived(typeof margin === 'number' ? margin : DEFAULT_FLOAT_PADDING);

  // clickToHide 解析：未传时 hover/click 默认 true（点击项关闭），custom/contextMenu 不受此控制。
  const resolvedClickToHide = $derived(clickToHide ?? true);

  // 供 render/menu 内 Dropdown.Item 点击后自动关闭（clickToHide）。经 context 上抛，
  // render（用户手写 Item）与 menu（生成 Item）行为一致。
  function requestCloseOnSelect() {
    if (trigger === 'custom') return;
    if (resolvedClickToHide) setOpen(false);
  }

  // 向子树透传：showTick / level+1 / trigger / 容器（子菜单浮层挂同容器）/ 关闭请求。
  setContext<DropdownContext>(DROPDOWN_CTX, {
    get showTick() {
      return showTick;
    },
    level: parentLevel + 1,
    get trigger() {
      return trigger;
    },
    get getContainer() {
      return resolvePopupContainer;
    },
    requestClose: requestCloseOnSelect,
  });

  // --- 受控 open（红线 #1）：custom trigger 完全受控；其余以 visible 受控优先，否则内部态 ---
  const isControlled = $derived(visible !== undefined);
  // eslint-disable-next-line -- 仅取 defaultVisible 初值作为非受控初始态
  let innerOpen = $state(untrack(() => defaultVisible));
  const isOpen = $derived(isControlled ? !!visible : innerOpen);

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
  }

  // --- 渲染保留策略：keepDOM=true 关闭后保留浮层 DOM（仅隐藏），否则关闭即卸载 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || (hasBeenOpened && keepDOM));

  // --- hover / focus 延迟开关 ---
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (enterTimer !== undefined) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (leaveTimer !== undefined) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
  }

  function onPointerEnter() {
    if (trigger !== 'hover') return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true), mouseEnterDelay);
  }

  function onPointerLeave(e: PointerEvent) {
    if (trigger !== 'hover') return;
    // 指针移入浮层（portal 到 body，在触发根之外）时不关闭。
    const related = e.relatedTarget as Node | null;
    if (related instanceof Element && menuWrapperEl?.contains(related)) return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  function onTriggerClick() {
    if (trigger !== 'click') return;
    setOpen(!isOpen);
  }

  function onTriggerFocusIn() {
    // focus 触发；或 hover 触发但未禁用 focus 监听（Semi disableFocusListener）。
    if (trigger === 'focus' || (trigger === 'hover' && !disableFocusListener)) {
      clearTimers();
      setOpen(true);
    }
  }

  function onTriggerFocusOut(e: FocusEvent) {
    if (trigger !== 'focus') return;
    const related = e.relatedTarget as Node | null;
    if (related instanceof Element && menuWrapperEl?.contains(related)) return;
    if (rootEl && related instanceof Node && rootEl.contains(related)) return;
    setOpen(false);
  }

  // --- contextMenu 触发：右键弹菜单，定位到鼠标光标处 ---
  let cursorX = $state(0);
  let cursorY = $state(0);

  function onContextMenu(e: MouseEvent) {
    if (trigger !== 'contextMenu') return;
    e.preventDefault();
    cursorX = e.clientX;
    cursorY = e.clientY;
    setOpen(true);
  }

  // --- DOM 引用 ---
  let rootEl = $state<HTMLSpanElement | null>(null);
  let menuWrapperEl = $state<HTMLDivElement | null>(null);

  // floating 定位锚点：非嵌套时 = rootEl（inline-block span，有正常 rect）；
  // 嵌套时 rootEl 为 display:contents 的 span（rect 全 0，不可锚定），改锚定其内部真实元素
  // （子 Dropdown 的触发器 Dropdown.Item <li>）。
  const anchorEl = $derived.by(() => {
    if (!rootEl) return rootEl;
    if (!isNested) return rootEl;
    return (rootEl.firstElementChild as HTMLElement | null) ?? rootEl;
  });

  // 浮层内可聚焦菜单项（本层直属 li[role=menuitem]，未禁用；不含嵌套子 Dropdown 浮层里的）。
  function menuItems(): HTMLElement[] {
    const scope = menuWrapperEl;
    if (!scope) return [];
    return [...scope.querySelectorAll<HTMLElement>('li[role="menuitem"]')].filter(
      (el) =>
        el.getAttribute('aria-disabled') !== 'true' &&
        // 仅本层：排除嵌套子 Dropdown 浮层（各自 portal，不在本 wrapper 内即天然排除；
        // 若同容器 absolute 定位则可能在内，按最近的 .cd-dropdown wrapper 归属过滤）。
        el.closest('.cd-dropdown-content') ===
          scope.querySelector('.cd-dropdown-content'),
    );
  }

  function focusItem(delta: number) {
    const list = menuItems();
    if (list.length === 0) return;
    const cur = list.findIndex((el) => el === document.activeElement);
    let next: number;
    if (cur < 0) next = delta > 0 ? 0 : list.length - 1;
    else next = (cur + delta + list.length) % list.length;
    list[next]?.focus();
  }

  // 触发器 aria action（对齐 Semi cloneElement 语义）：把 aria-haspopup/expanded/controls 写到
  // 用户提供的真实触发器元素（span 的首个 element child）本身，而非包裹 span——避免在无 role 的 span 上
  // 出现受限 aria（aria-allowed-attr），也避免 span role=button 与可聚焦 children 形成嵌套交互控件
  // （nested-interactive）。嵌套触发器（Dropdown.Item <li role=menuitem>）不写（其 menuitem 语义自足）。
  function triggerAria(node: HTMLElement, params: { open: boolean; controls: string; nested: boolean }) {
    function apply(open: boolean, controls: string, nested: boolean) {
      const target = node.firstElementChild as HTMLElement | null;
      if (!target || nested) return;
      target.setAttribute('aria-haspopup', 'menu');
      target.setAttribute('aria-expanded', String(open));
      target.setAttribute('aria-controls', controls);
    }
    apply(params.open, params.controls, params.nested);
    return {
      update(next: { open: boolean; controls: string; nested: boolean }) {
        apply(next.open, next.controls, next.nested);
      },
    };
  }

  // 打开后浮层需在下一帧挂载完成才能聚焦。
  function focusEdgeWhenReady(delta: number) {
    requestAnimationFrame(() => {
      const list = menuItems();
      (delta > 0 ? list[0] : list[list.length - 1])?.focus();
    });
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (trigger === 'custom') return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        // Semi：Enter/Space 直接 click 触发器（click 触发下打开并聚焦首项）。
        e.preventDefault();
        onTriggerClick();
        if (isOpen || trigger === 'click') focusEdgeWhenReady(1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          focusEdgeWhenReady(1);
        } else {
          focusEdgeWhenReady(1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          focusEdgeWhenReady(-1);
        } else {
          focusEdgeWhenReady(-1);
        }
        break;
      case 'Escape':
        if (isOpen) {
          onEscKeyDown?.(e);
          if (closeOnEsc && !isControlled) {
            e.preventDefault();
            setOpen(false);
          }
        }
        break;
      default:
        break;
    }
  }

  function onMenuKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        // 对齐 Semi foundation：Enter/Space 激活当前聚焦的菜单项（触发其 onClick）。
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.getAttribute('role') === 'menuitem'
        ) {
          e.preventDefault();
          document.activeElement.click();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusItem(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(-1);
        break;
      case 'Escape':
        onEscKeyDown?.(e);
        if (closeOnEsc && !isControlled) {
          e.preventDefault();
          setOpen(false);
          rootEl?.querySelector<HTMLElement>('[tabindex]')?.focus();
        }
        break;
      default:
        break;
    }
  }

  // click 触发打开后，焦点自动落首个非禁用项（Semi foundation.handleVisibleChange）。
  $effect(() => {
    if (isOpen && trigger === 'click') {
      focusEdgeWhenReady(1);
    }
  });

  // --- useDismiss（红线 #3）：Escape 复用；outside-click 自管理（识别嵌套子浮层为内部）---
  $effect(() => {
    if (!isOpen || !rootEl || trigger === 'custom') return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => {
        if (closeOnEsc) setOpen(false);
      },
      escape: closeOnEsc,
      outsideClick: false,
      extraTargets: [menuWrapperEl],
    });
    return cleanup;
  });

  // outside-click 命令式监听 + cleanup（红线 #3）：custom/contextMenu 不自动关的语义除外。
  // custom 完全受控不监听；其余 click/hover/focus/contextMenu 点外部关闭并回调 onClickOutSide。
  $effect(() => {
    if (!isOpen || !rootEl || trigger === 'custom') return;
    const root = rootEl;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (t && root.contains(t)) return;
      if (menuWrapperEl && t && menuWrapperEl.contains(t)) return;
      // 嵌套子 Dropdown 浮层（各自 portal）识别为内部。
      if (t instanceof Element && t.closest('.cd-dropdown')) return;
      onClickOutSide?.(e);
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  });

  // contextmenu 监听绑触发根（命令式 + cleanup）。
  $effect(() => {
    if (trigger !== 'contextMenu' || !rootEl) return;
    const el = rootEl;
    el.addEventListener('contextmenu', onContextMenu);
    return () => el.removeEventListener('contextmenu', onContextMenu);
  });

  $effect(() => clearTimers);

  // contextMenu 浮层定位：portal + fixed 到光标 x/y（floating action 只支持元素锚点）。
  function cursorFloating(node: HTMLElement, coords: { x: number; y: number }) {
    if (typeof document === 'undefined') {
      return { update() {}, destroy() {} };
    }
    const container = resolvePopupContainer?.() ?? document.body;
    const useAbsolute = container !== document.body;
    container.appendChild(node);
    node.style.position = useAbsolute ? 'absolute' : 'fixed';
    node.style.margin = '0';

    function place(x: number, y: number) {
      const rect = node.getBoundingClientRect();
      let left = Math.max(0, Math.min(x, window.innerWidth - rect.width));
      let top = Math.max(0, Math.min(y, window.innerHeight - rect.height));
      if (useAbsolute) {
        const cRect = container.getBoundingClientRect();
        left = left - cRect.left + container.scrollLeft;
        top = top - cRect.top + container.scrollTop;
      }
      node.style.insetInlineStart = `${Math.round(left)}px`;
      node.style.insetBlockStart = `${Math.round(top)}px`;
    }

    place(coords.x, coords.y);
    return {
      update(next: { x: number; y: number }) {
        place(next.x, next.y);
      },
      destroy() {
        node.remove();
      },
    };
  }

  // 浮层内点击：stopPropagation（Semi 默认 false）；clickToHide 关闭由 Item onClick 上抛（见下方 selectClose）。
  function onMenuClick(e: Event) {
    if (stopPropagation) e.stopPropagation();
  }


  const wrapperCls = $derived(
    ['cd-dropdown', className].filter(Boolean).join(' '),
  );
  const contentCls = $derived(
    ['cd-dropdown-content', contentClassName].filter(Boolean).join(' '),
  );
  const wrapperInlineStyle = $derived(`z-index:${zIndex}`);
</script>

{#snippet popContent()}
  <div class={contentCls} style={contentStyle}>
    {#if render}
      {@render render()}
    {:else if menu}
      <DropdownMenu>
        {#each menu as m, i (i)}
          {#if m.node === 'title'}
            <DropdownTitle>{m.name}</DropdownTitle>
          {:else if m.node === 'divider'}
            <DropdownDivider />
          {:else if m.node === 'item'}
            <DropdownItem
              key={m.key}
              disabled={m.disabled}
              active={m.active}
              type={m.type}
              icon={m.icon}
              onClick={m.onClick}
              onMouseEnter={m.onMouseEnter}
              onMouseLeave={m.onMouseLeave}
              onContextMenu={m.onContextMenu}
            >
              {m.name}
            </DropdownItem>
          {/if}
        {/each}
      </DropdownMenu>
    {/if}
  </div>
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!--
  触发器包裹 span：承载交互（keydown/click/hover/focus 事件由内部可聚焦 children 冒泡至此），
  自身无 role/aria——aria-haspopup/expanded/controls 经 use:triggerAria 写到真实触发器元素本身
  （对齐 Semi cloneElement 语义），避免 aria-allowed-attr / nested-interactive 违规。
  嵌套时 span 为 display:contents 无盒子，内部 li（Dropdown.Item role=menuitem）语义自足。
-->
<span
  class="cd-dropdown-trigger"
  class:cd-dropdown-trigger--nested={isNested}
  id={triggerId}
  bind:this={rootEl}
  use:triggerAria={{ open: isOpen, controls: menuId, nested: isNested }}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onclick={onTriggerClick}
  onfocusin={onTriggerFocusIn}
  onfocusout={onTriggerFocusOut}
  onkeydown={onTriggerKeydown}
>
  {@render children?.()}
</span>

{#if isOpen && trigger === 'contextMenu'}
  <!-- contextMenu：wrapper portal 到 body 并定位到光标 x/y -->
  <div
    class={wrapperCls}
    id={menuId}
    bind:this={menuWrapperEl}
    style={wrapperInlineStyle}
    class:cd-dropdown--motion={motion}
    use:cursorFloating={{ x: cursorX, y: cursorY }}
    onkeydown={onMenuKeydown}
    onclick={onMenuClick}
    onpointerdown={onMenuClick}
    role="presentation"
  >
    {@render popContent()}
  </div>
{:else if shouldRender}
  <div
    class={wrapperCls}
    id={menuId}
    bind:this={menuWrapperEl}
    style={wrapperInlineStyle}
    class:cd-dropdown--hidden={!isOpen}
    class:cd-dropdown--motion={motion && isOpen}
    use:floating={{ trigger: anchorEl, placement: position, autoAdjust: autoAdjustOverflow, offset, padding: floatPadding, getContainer: resolvePopupContainer, open: isOpen, rePosKey }}
    onkeydown={onMenuKeydown}
    onpointerenter={() => trigger === 'hover' && clearTimers()}
    onpointerleave={onPointerLeave}
    onclick={onMenuClick}
    onpointerdown={onMenuClick}
    role="presentation"
  >
    {@render popContent()}
  </div>
{/if}

<style>
  .cd-dropdown-trigger {
    display: inline-block;
  }
  .cd-dropdown-trigger:focus-visible {
    outline: none;
  }
  /* 嵌套：子 Dropdown 触发器为 Dropdown.Item（<li>），需直接参与父 ul 布局，
     故包裹 span 用 display:contents 不产生盒子（li 视觉归位 ul，事件仍经 span 冒泡处理）。 */
  .cd-dropdown-trigger--nested {
    display: contents;
  }
  /* 浮层 wrapper：portal 到 body，由 use:floating 写 position:fixed + transform 定位。
     对齐 Semi .semi-dropdown（+ wrapper 的 shadow/radius/bg/z）。 */
  .cd-dropdown {
    z-index: var(--cd-z-dropdown);
    border-radius: var(--cd-radius-dropdown);
    background: var(--cd-color-dropdown-bg-default);
    box-shadow: var(--cd-shadow-elevated);
    backdrop-filter: var(--cd-filter-dropdown-bg);
    overflow-y: auto;
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
  }
  /* keepDOM 关闭后保留 DOM 但不可见 */
  .cd-dropdown--hidden {
    display: none;
  }
  /* motion：进场淡入；定位 transform 由 use:floating 写入 inline style，
     keyframe 绝不能设 transform（会覆盖 translate 使浮层飘走），故只动 opacity。 */
  .cd-dropdown--motion {
    animation: cd-dropdown-in var(--cd-motion-duration-fast) var(--cd-motion-ease-standard) both;
  }
  @keyframes cd-dropdown-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-dropdown--motion {
      animation: none;
    }
  }
</style>
