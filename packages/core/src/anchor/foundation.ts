/**
 * createAnchor — framework-agnostic state machine for the Anchor component.
 * Ported 逐行 from Semi semi-foundation/anchor/foundation.ts (AnchorFoundation).
 * See specs/components/navigation/Anchor.spec.md §3.
 *
 * 纯状态机：链接注册表增删、scroll-spy 决策（handleScroll：取最后一个越过阈值的 link）、
 * 点击滚动调度（handleClick/_scrollIntoView）、滑块定位（_setActiveSlide）。所有 DOM I/O
 * （querySelector、getBoundingClientRect、scrollIntoView、事件绑定）经 adapter 注入；
 * 本模块只算不碰 DOM。
 * state 由渲染层持有（Svelte runes），经 getState/setState 桥接，与 upload/foundation.ts 同构。
 *
 * childMap 构建（Semi _getLinkToMap/setChildMap）未在此复刻：本库 <Anchor.Link> 是组合式
 * 声明树（非 Semi 的 React children prop 命令式遍历），链接树天然是 Svelte `$derived` 状态，
 * 由 Anchor.svelte 用响应式 buildChildMap 派生，比命令式 setChildMap 调用更贴合 runes 语义。
 */

import { ANCHOR_PREFIX } from './constants.js';

/** adapter：渲染层注入的 DOM I/O + 变更通知。core 只调、不持有 DOM 引用。 */
export interface AnchorAdapter {
  getContainer: () => HTMLElement | Window;
  getContainerBoundingTop: () => number;
  getLinksBoundingTop: () => number[];
  /** 在 Anchor 根节点范围内查找元素（对齐 Semi getAnchorNode：#anchorID selector）。 */
  getAnchorNode: (selector: string) => HTMLElement | null;
  /** 查找滚动目标节点（对齐 Semi getContentNode：document.querySelector(href)）。 */
  getContentNode: (selector: string) => HTMLElement | null;
  /** 执行滚动（对齐 Semi scrollIntoView 内的 behavior 回调：滚动最内层可滚容器）。 */
  scrollIntoView: (targetNode: HTMLElement, offsetTop: number, smooth: boolean) => void;
  notifyChange: (currentLink: string, previousLink: string) => void;
  notifyClick: (e: unknown, link: string) => void;
}

export interface AnchorFoundationProps {
  offsetTop: number;
  targetOffset: number;
  scrollMotion: boolean;
  onChange?: ((currentLink: string, previousLink: string) => void) | undefined;
  onClick?: ((e: unknown, link: string) => void) | undefined;
}

export interface AnchorFoundationState {
  activeLink: string;
  links: string[];
  clickLink: boolean;
  scrollHeight: string;
  slideBarTop: string;
}

export function createAnchor(options: {
  adapter: AnchorAdapter;
  getProps: () => AnchorFoundationProps;
  getState: () => AnchorFoundationState;
  setState: (patch: Partial<AnchorFoundationState>) => void;
}) {
  const { adapter, getProps, getState, setState } = options;

  const addLink = (link: string) => {
    const { links } = getState();
    setState({ links: [...links, link] });
  };

  const removeLink = (link: string) => {
    const { links } = getState();
    const index = links.indexOf(link);
    if (index !== -1) {
      const next = links.slice();
      next.splice(index, 1);
      setState({ links: next });
    }
  };

  const setActiveSlide = () => {
    const activeSelector = `.${ANCHOR_PREFIX}-link-title-active`;
    const linkNode = adapter.getAnchorNode(activeSelector);
    if (linkNode) {
      setState({ slideBarTop: `${linkNode.offsetTop}px` });
    }
  };

  const setActiveLink = (link: string, prevLink: string, shouldNotify = true) => {
    const { activeLink } = getState();
    const { onChange } = getProps();
    if (activeLink !== link) {
      setState({ activeLink: link });
      setActiveSlide();
      if (onChange && shouldNotify) {
        adapter.notifyChange(link, prevLink);
      }
    }
  };

  /** 调整滑轨高度以匹配链接内容高度（对齐 Semi setScrollHeight）。 */
  const setScrollHeight = () => {
    const anchorWrapper = `.${ANCHOR_PREFIX}-link-wrapper`;
    const anchorNode = adapter.getAnchorNode(anchorWrapper);
    if (anchorNode) {
      setState({ scrollHeight: `${anchorNode.scrollHeight}px` });
    }
  };

  const getLinksTop = () => adapter.getLinksBoundingTop();

  /** scroll-spy 决策（对齐 Semi handleScroll：取最后一个越过阈值 top<0 的 link）。 */
  const handleScroll = () => {
    const { clickLink, links, activeLink: prevActiveLink } = getState();
    if (clickLink) return;
    const elTop = getLinksTop();
    let lastNegative = -Infinity;
    let lastNegativeIndex = -1;
    for (let i = 0; i < elTop.length; i++) {
      const top = elTop[i];
      if (top !== undefined && top < 0 && top > lastNegative) {
        lastNegative = top;
        lastNegativeIndex = i;
      }
    }
    const activeLink = links[lastNegativeIndex];
    if (activeLink !== undefined) {
      setActiveLink(activeLink, prevActiveLink);
    }
  };

  /** 滚动到目标（对齐 Semi _scrollIntoView）。 */
  const scrollIntoViewByLink = (link: string) => {
    const { scrollMotion, targetOffset } = getProps();
    const destNode = adapter.getContentNode(link);
    if (destNode) {
      adapter.scrollIntoView(destNode, targetOffset, scrollMotion);
    }
  };

  /** 点击/激活链接（对齐 Semi handleClick）。 */
  const handleClick = (e: unknown, link: string, shouldNotify = true) => {
    const destNode = adapter.getContentNode(link);
    const { activeLink: prevLink } = getState();
    setActiveLink(link, prevLink, shouldNotify);
    if (destNode) {
      setState({ clickLink: true });
      scrollIntoViewByLink(link);
    }
    if (shouldNotify) adapter.notifyClick(e, link);
  };

  /** 点击后解除 scroll-spy 锁（对齐 Semi handleClickLink，由渲染层 debounce 后调用）。 */
  const handleClickLink = () => {
    setState({ clickLink: false });
  };

  return {
    addLink,
    removeLink,
    setActiveLink,
    setScrollHeight,
    getLinksTop,
    handleScroll,
    handleClick,
    handleClickLink,
  };
}

export type AnchorFoundation = ReturnType<typeof createAnchor>;
