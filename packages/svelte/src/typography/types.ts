// Typography 共享类型（对齐 Semi typography/interface.ts）。
import type { Snippet } from 'svelte';
import type { EllipsisPos } from '@chenzy-design/core';

/** Semi 语义色类型（对齐 strings.TYPE）。 */
export type TypoType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'warning'
  | 'danger'
  | 'success';
/** Semi size（对齐 strings.SIZE）。 */
export type TypoSize = 'normal' | 'small' | 'inherit';

/**
 * showTooltip 浮层透传选项（对齐 Semi opts）。content 指定浮层显示的自定义内容
 * （非原文）；theme/placement/maxWidth 透传 Tooltip；popover 额外接受 title。
 */
export interface EllipsisTooltipOpts {
  content?: string;
  title?: string;
  theme?: 'dark' | 'light';
  placement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number | string;
  className?: string;
  style?: string;
  /** 仅 popover 类型生效；对齐 Semi showTooltip popover 分支默认 true。 */
  showArrow?: boolean;
}
/**
 * showTooltip 配置（对齐 Semi）：
 *  - `true`：默认 Tooltip，浮层 = 完整原文。
 *  - `{ opts: { content } }`：浮层显示自定义内容。
 *  - `{ type: 'popover', opts }`：用 Popover 而非 Tooltip。
 *  - `{ renderTooltip }`：完全自定义浮层。Semi 的 `(content, children) => VNode`
 *    在 Svelte 中表达为 snippet `(fullText, trigger) => 浮层`。
 */
export interface EllipsisShowTooltip {
  type?: 'tooltip' | 'popover';
  opts?: EllipsisTooltipOpts;
  renderTooltip?: Snippet<[string, Snippet]>;
}

export interface EllipsisConfig {
  rows?: number;
  expandable?: boolean;
  /** 展开后是否可折叠回去（Semi collapsible）；默认 false */
  collapsible?: boolean;
  expandText?: string;
  collapseText?: string;
  suffix?: string;
  pos?: EllipsisPos;
  showTooltip?: boolean | EllipsisShowTooltip;
  /** 展开/收起回调（对齐 Semi onExpand(expanded, event)）。 */
  onExpand?: (expanded: boolean, e: MouseEvent) => void;
}
/** 复制配置（对齐 Semi CopyableConfig）。 */
export interface CopyableConfig {
  /** 复制到剪贴板的内容（默认取节点文本）。 */
  content?: string;
  /** 复制图标 tooltip 文案（默认 i18n copy）。 */
  copyTip?: string;
  /** 复制成功提示（默认 i18n copied）。 */
  successTip?: string;
  /** 自定义复制图标（对齐 Semi icon）。 */
  icon?: Snippet;
  /** 复制回调（对齐 Semi onCopy(e, content, res)）。 */
  onCopy?: (e: MouseEvent, content: string, res: boolean) => void;
  /**
   * 完全接管复制控件渲染（对齐 Semi copyable.render）。
   * 参数：copied 是否已复制、doCopy 触发复制、config 当前 CopyableConfig。
   */
  render?: Snippet<[boolean, (e: MouseEvent) => void, CopyableConfig]>;
}
