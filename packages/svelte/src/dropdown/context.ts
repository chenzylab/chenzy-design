/**
 * Dropdown 子树共享上下文。
 * 目前仅透传 getPopupContainer，使递归的 DropdownItemNode 子菜单浮层挂到与顶层
 * 浮层相同的自定义容器（而非各自 portal 到 body）。
 */
export interface DropdownContext {
  /** 浮层挂载容器解析器；缺省时（undefined）floating 默认挂 body。 */
  getContainer?: (() => HTMLElement | null | undefined) | undefined;
}

export const DROPDOWN_CTX = Symbol('cd-dropdown-ctx');
