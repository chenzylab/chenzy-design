<!--
  Typography.Paragraph — see specs/components/basic/Typography.spec.md
  Renders a <p>. ellipsis / copyable / editable 经 TypographyBase 组合 core 原语。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TypographyBase, {
    type EllipsisConfig,
    type CopyableConfig,
    type EditableConfig,
  } from './TypographyBase.svelte';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'success';
  type TypoWeight = number | 'regular' | 'medium' | 'semibold' | 'bold';
  type TypoSize = 'small' | 'default' | 'large';

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
    component = 'p',
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
  extraClass="cd-typography--paragraph"
  {type}
  {size}
  {strong}
  {weight}
  {disabled}
  {mark}
  {underline}
  delete={del}
  {code}
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
