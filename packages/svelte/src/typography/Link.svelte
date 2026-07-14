<!--
  Typography.Link — see specs/components/basic/Typography.spec.md
  Renders an <a>. 外链 target=_blank 自动补 rel="noopener noreferrer"；
  disabled 移除 href + aria-disabled + tabindex=-1。
  ellipsis / copyable / editable 经 TypographyBase 组合 core 原语。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TypographyBase, {
    type EllipsisConfig,
    type CopyableConfig,
    type EditableConfig,
  } from './TypographyBase.svelte';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'quaternary' | 'warning' | 'danger' | 'success';
  type TypoWeight = number | 'regular' | 'medium' | 'semibold' | 'bold';

  interface Props {
    href?: string;
    target?: string;
    rel?: string;
    type?: TypoType;
    strong?: boolean;
    weight?: TypoWeight;
    disabled?: boolean;
    mark?: boolean;
    /** Link 默认带下划线 */
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 斜体（对齐 Semi）。 */
    italic?: boolean;
    /** 前置图标（对齐 Semi）；链接下不带下划线。 */
    icon?: Snippet;
    component?: string;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    editable?: boolean | EditableConfig;
    value?: string;
    onChange?: (value: string) => void;
    onCopy?: (content: string) => void;
    onEditStart?: () => void;
    onEditCancel?: () => void;
    onExpand?: (expanded: boolean) => void;
    onClick?: (e: MouseEvent) => void;
    class?: string;
    /** 自定义内联样式（对齐 Semi Typography style）。 */
    style?: string;
    children?: Snippet;
  }

  let {
    href,
    target,
    rel,
    type = 'default',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    italic = false,
    icon,
    component = 'a',
    ellipsis = false,
    copyable = false,
    editable = false,
    value,
    onChange,
    onCopy,
    onEditStart,
    onEditCancel,
    onExpand,
    onClick,
    class: className = '',
    style,
    children,
  }: Props = $props();

  // target=_blank 且未显式 rel → 自动 noopener noreferrer
  const resolvedRel = $derived(rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined));
  // disabled 移除 href 行为
  const resolvedHref = $derived(disabled ? undefined : href);

  function handleClick(e: MouseEvent): void {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  }

  const hostAttrs = $derived({
    href: resolvedHref,
    target,
    rel: resolvedRel,
    tabindex: disabled ? -1 : undefined,
    onclick: handleClick,
  });
</script>

<TypographyBase
  element={component}
  baseClass="cd-typography"
  extraClass="cd-typography--link"
  {type}
  {strong}
  {weight}
  {disabled}
  {mark}
  {underline}
  delete={del}
  {code}
  {italic}
  {icon}
  class={className}
  {style}
  {ellipsis}
  {copyable}
  {editable}
  {value}
  {onChange}
  {onCopy}
  {onEditStart}
  {onEditCancel}
  {onExpand}
  {hostAttrs}
>
  {@render children?.()}
</TypographyBase>
