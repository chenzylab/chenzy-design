<!--
  Typography.Text — see specs/components/basic/Typography.spec.md
  Renders a <span>. Shares the cd-typography base style class.
  ellipsis / copyable / editable 交互经 TypographyBase 组合 @chenzy-design/core 原语。
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
  type TypoSize = 'small' | 'default' | 'large' | 'inherit';

  interface Props {
    type?: TypoType;
    /** 字号档 small/default/large。spec §4.1 L60 */
    size?: TypoSize;
    strong?: boolean;
    weight?: TypoWeight;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    /** 斜体（对齐 Semi）。 */
    italic?: boolean;
    /** 前置图标（对齐 Semi）。 */
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
    class?: string;
    children?: Snippet;
  }

  let {
    type = 'default',
    size = 'default',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    italic = false,
    icon,
    component = 'span',
    ellipsis = false,
    copyable = false,
    editable = false,
    value,
    onChange,
    onCopy,
    onEditStart,
    onEditCancel,
    onExpand,
    class: className = '',
    children,
  }: Props = $props();
</script>

<TypographyBase
  element={component}
  baseClass="cd-typography"
  extraClass="cd-typography--text"
  {type}
  {size}
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
  {ellipsis}
  {copyable}
  {editable}
  {value}
  {onChange}
  {onCopy}
  {onEditStart}
  {onEditCancel}
  {onExpand}
>
  {@render children?.()}
</TypographyBase>
