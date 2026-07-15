<!--
  Typography.Text — 渲染 <span>，对齐 Semi Typography.Text。
  共享 cd-typography 基础样式，ellipsis / copyable 交互经 TypographyBase 组合 core 原语。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TypographyBase, {
    type TypoType,
    type TypoSize,
    type EllipsisConfig,
    type CopyableConfig,
  } from './TypographyBase.svelte';

  interface Props {
    type?: TypoType;
    /** 字号档 normal / small / inherit（对齐 Semi）。 */
    size?: TypoSize;
    strong?: boolean;
    /** 字重（数字，对齐 Semi Text weight: number）。 */
    weight?: number;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 前置图标（对齐 Semi icon）。 */
    icon?: Snippet;
    /** 链接（对齐 Semi link）：true 或透传给 <a> 的属性对象。 */
    link?: boolean | Record<string, unknown>;
    component?: string;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    onExpand?: (expanded: boolean, e: MouseEvent) => void;
    class?: string;
    /** 自定义内联样式（对齐 Semi Typography style）。 */
    style?: string;
    children?: Snippet;
  }

  let {
    type = 'primary',
    size = 'normal',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    icon,
    link = false,
    component = 'span',
    ellipsis = false,
    copyable = false,
    onExpand,
    class: className = '',
    style,
    children,
  }: Props = $props();
</script>

<TypographyBase
  element={component}
  {type}
  {size}
  {strong}
  {weight}
  {disabled}
  {mark}
  {underline}
  delete={del}
  {code}
  {icon}
  {link}
  class={className}
  {style}
  {ellipsis}
  {copyable}
  {onExpand}
>
  {@render children?.()}
</TypographyBase>
