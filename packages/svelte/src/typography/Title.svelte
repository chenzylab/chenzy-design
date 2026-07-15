<!--
  Typography.Title — 渲染 <h1>..<h6>，对齐 Semi Typography.Title。
  heading 决定标签与 cd-typography-h{n} 类；weight 字符串枚举走字重类，数字走内联 style。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TypographyBase, {
    type TypoType,
    type EllipsisConfig,
    type CopyableConfig,
  } from './TypographyBase.svelte';

  type TitleWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'default' | number;

  interface Props {
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    type?: TypoType;
    strong?: boolean;
    /** 字重（对齐 Semi Title weight：字符串枚举走类，数字走 style）。 */
    weight?: TitleWeight;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 链接（对齐 Semi link）。 */
    link?: boolean | Record<string, unknown>;
    component?: string;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    onExpand?: (expanded: boolean, e: MouseEvent) => void;
    class?: string;
    style?: string;
    /** 透传到根元素的 id（供 aria-labelledby 关联）。 */
    id?: string;
    children?: Snippet;
  }

  let {
    heading = 1,
    type = 'primary',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    link = false,
    component,
    ellipsis = false,
    copyable = false,
    onExpand,
    class: className = '',
    style,
    id,
    children,
  }: Props = $props();

  const element = $derived(component ?? `h${heading}`);
  const headingClass = $derived(`h${heading}`);
  const hostAttrs = $derived(id ? { id } : undefined);
</script>

<TypographyBase
  {element}
  extraClass={`cd-typography-h${heading}`}
  heading={headingClass}
  {hostAttrs}
  {type}
  {strong}
  {weight}
  {disabled}
  {mark}
  {underline}
  delete={del}
  {code}
  {link}
  class={className}
  {style}
  {ellipsis}
  {copyable}
  {onExpand}
>
  {@render children?.()}
</TypographyBase>
