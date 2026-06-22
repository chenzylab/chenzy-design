import { getContext, setContext } from 'svelte';

export type CollapseSize = 'small' | 'default' | 'large';
export type CollapseIconPosition = 'left' | 'right';

/**
 * 父 Collapse 向声明式 <Collapse.Panel> 暴露的上下文。
 * 全部用 getter 跨 context 边界保持对父 prop / 展开态变化的响应性
 * （直接读快照会冻结初始值）。
 * 红线 #2: isActive / shouldRender 为纯派生函数，render 期只读不写。
 */
export interface CollapseContext {
  /** 该 key 当前是否展开（受控读 prop、非受控读本地 set，均由父派生）。 */
  isActive: (key: string) => boolean;
  /** 该 key 内容是否应渲染（lazyRender / keepDOM 策略）。 */
  shouldRender: (key: string) => boolean;
  /** 点击 header 切换展开态；panelDisabled 为该面板自身 disabled。 */
  toggle: (key: string, panelDisabled?: boolean) => void;
  /**
   * Header 点击入口：先发 on:headerClick（埋点，disabled 拦截前），再 toggle。
   * 声明式 <Collapse.Panel> 的 header onclick 应调此，保证 headerClick 事件统一从父发出。
   */
  headerClick: (event: MouseEvent, key: string, panelDisabled?: boolean) => void;
  /** 父级整体 disabled。 */
  getDisabled: () => boolean;
  getSize: () => CollapseSize;
  getIconPosition: () => CollapseIconPosition;
  /** header/region id 前缀，用于 aria 关联。 */
  getIdBase: () => string;
  /** Header role=heading 的 aria-level。 */
  getHeadingLevel: () => number;
  /**
   * roving tabindex（纯派生）：焦点 Header / 首个未禁用 Header 为 0，其余 -1。
   * 红线 #2：render 期只读，不写父级 $state。
   */
  headerTabindex: (key: string, panelDisabled?: boolean) => 0 | -1;
  /** Header keydown：↑↓ roving + Home/End（命令式 focus()，非 render 期）。 */
  onHeaderKeydown: (event: KeyboardEvent, key: string) => void;
  /** Header 获得焦点时同步 focusedKey。 */
  onHeaderFocus: (key: string) => void;
}

const KEY = Symbol('cd-collapse');

export function setCollapseContext(ctx: CollapseContext): void {
  setContext(KEY, ctx);
}

export function getCollapseContext(): CollapseContext | undefined {
  return getContext<CollapseContext | undefined>(KEY);
}
