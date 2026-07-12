/**
 * Dropdown 子树共享上下文（对齐 Semi dropdown/context）。
 *  - showTick：是否在 active 的 Dropdown.Item 左侧显示对勾（IconTick）。
 *  - level：嵌套层级，顶层 Dropdown 渲染 content 时 +1；子 Dropdown 据此判定
 *    嵌套（level>1）——用于嵌套默认间距（NESTED_SPACING）与嵌套项事件语义。
 *  - trigger：顶层触发方式，透传供子层参考。
 *  - getContainer：浮层挂载容器解析器，子菜单浮层挂到与顶层相同的自定义容器。
 */
export interface DropdownContext {
  /** active 的 Dropdown.Item 是否显示对勾（默认 false）。 */
  showTick?: boolean;
  /** 嵌套层级（顶层 content 内为 1，其内的子 Dropdown content 为 2…）。 */
  level: number;
  /** 顶层触发方式。 */
  trigger?: string;
  /** 浮层挂载容器解析器；缺省（undefined）floating 默认挂 body。 */
  getContainer?: (() => HTMLElement | null | undefined) | undefined;
  /**
   * Dropdown.Item 点击后请求关闭浮层（clickToHide）。由本层 Dropdown 提供，
   * render 模式下用户手写的 Item 与 menu 生成的 Item 统一经此上抛，行为一致。
   */
  requestClose?: () => void;
}

export const DROPDOWN_CTX = Symbol('cd-dropdown-ctx');
