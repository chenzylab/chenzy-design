/**
 * Nav 上下文：Nav 独立渲染（不委托 Menu）。分两个 context：
 *  1) NAV_CONTEXT_KEY — 渲染态与行为（选中/展开/折叠/模式/回调/浮层配置），
 *     供递归的 NavItemRender / NavSubPopup / NavHeader / NavFooter 读取。
 *  2) NAV_COLLECTOR_KEY — 声明式子项收集（Nav.Item / Nav.Sub），仅在用 children
 *     声明式写法时使用，把子项收进普通数组树。
 */
import { getContext, hasContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { NavItemDef, NavKey, NavMode, NavDropdownProps } from './types.js';

/** Nav 渲染上下文：递归子项据此判断选中/展开/折叠并触发行为。 */
export interface NavContext {
  /** 当前模式。 */
  readonly mode: NavMode;
  /** 是否折叠（仅 vertical 有意义）。 */
  readonly collapsed: boolean;
  /** 是否多选。 */
  readonly multiple: boolean;
  /** 整体禁用。 */
  readonly disabled: boolean;
  /** 仅一级缩进（true）/逐级缩进（false）。 */
  readonly limitIndent: boolean;
  /** toggle 箭头位置。 */
  readonly toggleIconPosition: 'left' | 'right';
  /** openKeys 是否受控（仅 vertical 且未折叠时为真，对齐 Semi openKeysIsControlled）。 */
  readonly openKeysIsControlled: boolean;
  /** Nav 级：透传给所有子导航浮层 Dropdown 的默认属性（对齐 Semi subDropdownProps）。 */
  readonly subDropdownProps: NavDropdownProps | undefined;
  /** 子导航展开动画开关。 */
  readonly subNavMotion: boolean;
  /** 浮层子导航展开延迟 ms。 */
  readonly subNavOpenDelay: number;
  /** 浮层子导航关闭延迟 ms。 */
  readonly subNavCloseDelay: number;
  /** 折叠态 tooltip 显示延迟 ms。 */
  readonly tooltipShowDelay: number;
  /** 折叠态 tooltip 隐藏延迟 ms。 */
  readonly tooltipHideDelay: number;
  /** 浮层挂载容器。 */
  readonly getPopupContainer: (() => HTMLElement | null | undefined) | undefined;
  /** 自定义展开箭头图标。 */
  readonly expandIcon: Snippet | undefined;
  /** 自定义导航项外层包裹（payload 对齐 Semi {itemElement,isSubNav,isInSubNav,props}）。 */
  readonly renderWrapper:
    | Snippet<
        [
          {
            item: NavItemDef;
            isSubNav: boolean;
            isInSubNav: boolean;
            props: NavItemDef;
            children: Snippet;
          },
        ]
      >
    | undefined;

  /** 判断某 key 是否选中。 */
  isSelected: (key: NavKey) => boolean;
  /** 判断某 key 是否展开。 */
  isOpen: (key: NavKey) => boolean;
  /** 选中一个叶子项（内部处理受控/非受控 + 单/多选 + 回调）。 */
  selectLeaf: (item: NavItemDef, domEvent?: Event) => void;
  /** 展开/收起一个子导航（内部处理受控/非受控 + 回调）。 */
  toggleOpen: (item: NavItemDef, willOpen: boolean, domEvent?: Event) => void;
  /** 折叠切换（Footer 收起按钮用）。 */
  toggleCollapsed: () => void;
}

export const NAV_CONTEXT_KEY = Symbol('cd-nav');

/** 读取 Nav 渲染上下文（无则 undefined）。 */
export function getNavContext(): NavContext | undefined {
  return hasContext(NAV_CONTEXT_KEY) ? (getContext(NAV_CONTEXT_KEY) as NavContext) : undefined;
}

/**
 * 声明式子项收集上下文（Nav.Item / Nav.Sub）。
 *
 * 安全约束（见记忆 svelte5-child-register-state-array-loop）：
 * - 子项注册写入的 children 是【普通数组】（非 $state），子项 init 同步 push，不在 effect 里写 $state。
 * - 触发 Nav 重建 items 的反应量是单独一个 $state revision，子项在挂载后【异步】bump 一次，
 *   脱离挂载 effect 同步栈，避免读写自循环。
 * - Nav.Sub 向下提供一个新的 collector，其 children 指向自己 descriptor 的 children 数组。
 */
export interface NavCollector {
  /** 把一个子项描述符按声明顺序 push 进当前层级的普通数组，返回该描述符（供 Sub 取其 children）。 */
  add: (item: NavItemDef) => NavItemDef;
  /** 挂载后异步触发一次 Nav 重建（合并多次为一次）。 */
  bump: () => void;
}

export const NAV_COLLECTOR_KEY = Symbol('cd-nav-collector');

export function getNavCollector(): NavCollector | undefined {
  return hasContext(NAV_COLLECTOR_KEY)
    ? (getContext(NAV_COLLECTOR_KEY) as NavCollector)
    : undefined;
}
