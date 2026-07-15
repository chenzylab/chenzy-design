<!--
  Typography.Paragraph — 渲染 <p>，对齐 Semi Typography.Paragraph。
  拼 cd-typography-paragraph 类；spacing=extended 走宽松行距。
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
    /** 字号档 normal / small（对齐 Semi）。 */
    size?: TypoSize;
    strong?: boolean;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 行距：normal / extended（对齐 Semi spacing）。 */
    spacing?: 'normal' | 'extended';
    /** 链接（对齐 Semi link）。 */
    link?: boolean | Record<string, unknown>;
    component?: string;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    onExpand?: (expanded: boolean, e: MouseEvent) => void;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    type = 'primary',
    size = 'normal',
    strong = false,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    spacing = 'normal',
    link = false,
    component = 'p',
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
  extraClass="cd-typography-paragraph"
  {type}
  {size}
  {strong}
  {disabled}
  {mark}
  {underline}
  delete={del}
  {code}
  {spacing}
  {link}
  class={className}
  {style}
  {ellipsis}
  {copyable}
  {onExpand}
>
  {@render children?.()}
</TypographyBase>
