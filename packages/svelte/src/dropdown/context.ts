/**
 * Dropdown 子树共享上下文。
 * 透传 getPopupContainer，使递归的 DropdownItemNode 子菜单浮层挂到与顶层
 * 浮层相同的自定义容器；同时透传 showTick，在叶子项右侧渲染勾选标记。
 */
export interface DropdownContext {
  /** 浮层挂载容器解析器；缺省时（undefined）floating 默认挂 body。 */
  getContainer?: (() => HTMLElement | null | undefined) | undefined;
  /** 已选中的 Item 是否显示 ✓ 勾选标记（默认 false）。 */
  showTick?: boolean;
}

export const DROPDOWN_CTX = Symbol('cd-dropdown-ctx');
