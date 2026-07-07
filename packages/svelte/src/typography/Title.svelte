<!--
  Typography.Title — see specs/components/basic/Typography.spec.md
  Renders an <h1>..<h6>. ellipsis / copyable / editable 经 TypographyBase 组合 core 原语。
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
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    type?: TypoType;
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
    heading = 1,
    type = 'default',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    component,
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

  const element = $derived(component ?? `h${heading}`);
</script>

<TypographyBase
  {element}
  baseClass="cd-typography"
  extraClass={`cd-typography--title cd-typography--h${heading}`}
  {type}
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
