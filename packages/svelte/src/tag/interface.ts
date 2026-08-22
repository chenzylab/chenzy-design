/**
 * Tag / TagGroup / SplitTagGroup 共享类型定义。
 * 严格对齐 Semi semi-ui/tag/interface.ts（类型名 1:1）。
 */
import type { Snippet } from 'svelte';

export type TagColor =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'grey'
  | 'indigo'
  | 'light-blue'
  | 'light-green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'violet'
  | 'yellow'
  | 'white';
export type TagType = 'ghost' | 'solid' | 'light';
export type TagSize = 'default' | 'small' | 'large';
export type AvatarShape = 'circle' | 'square';
export type TagShape = 'circle' | 'square';

export interface TagProps {
  children?: Snippet;
  tagKey?: string | number;
  size?: TagSize;
  color?: TagColor;
  type?: TagType;
  closable?: boolean;
  visible?: boolean;
  onClose?: (tagChildren: unknown, e: MouseEvent | KeyboardEvent, tagKey: string | number | undefined) => void;
  onClick?: (e: MouseEvent | KeyboardEvent) => void;
  prefixIcon?: Snippet;
  suffixIcon?: Snippet;
  style?: string;
  class?: string;
  avatarSrc?: string;
  colorful?: boolean;
  gradient?: boolean;
  avatarShape?: AvatarShape;
  shape?: TagShape;
  onKeyDown?: (e: KeyboardEvent) => void;
  'aria-label'?: string;
  tabIndex?: number;
  onMouseEnter?: (e: MouseEvent) => void;
}

/** TagGroup 单个 tagList 项（普通用法子集）。mode='custom' 时 tagList 元素改为 Snippet，见 TagGroupProps。 */
export interface TagItem extends Omit<TagProps, 'children'> {
  children?: string;
  [key: string]: unknown;
}

export interface TagGroupProps {
  style?: string;
  class?: string;
  maxTagCount?: number;
  restCount?: number;
  tagList?: TagItem[];
  size?: TagSize;
  showPopover?: boolean;
  popoverProps?: Record<string, unknown>;
  avatarShape?: AvatarShape;
  mode?: string;
  /**
   * mode='custom' 时渲染单个 tagList 项为完整 Tag 节点。对齐 Semi custom 模式下 tagList 元素直接是
   * 预构建 ReactNode 的语义——Svelte Snippet 是运行时受控的模板函数，无法脱离 {#snippet} 声明处被
   * bind/包装后随意转发调用，故以 renderTagItem(item) 参数化 snippet 承接，为框架差异导致的必要设计。
   */
  renderTagItem?: Snippet<[TagItem]>;
  onTagClose?: (tagChildren: unknown, e: unknown, tagKey: string | number | undefined) => void;
  onPlusNMouseEnter?: (e: MouseEvent) => void;
}

export interface SplitTagGroupProps {
  'aria-label'?: string;
  class?: string;
  style?: string;
  children?: Snippet;
}
