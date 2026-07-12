<!--
  Descriptions.Item — 镜像 Semi descriptions/item.tsx。
  三种单元格形态：
    - plain（align==='plain'）：单个 <td.item colspan={span}>，key 后内联冒号，key 与 value 同排。
    - 非 plain：<th.item.item-th>（key）+ <td.item.item-td colspan={span?span*2-1:1}>（value）成对。
  外层包裹：
    - layout==='vertical'：每个 Item 自成一行 <tr>。
    - layout==='horizontal'：不包 tr（由父 Descriptions 的行分组循环提供 <tr>），只渲裸单元格。
  hidden 为 true 时不渲染（对齐 Semi）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDescriptionsContext } from './context.js';

  interface Props {
    /** 键值（label）。 */
    itemKey?: string | undefined;
    /** 是否隐藏不展示。 */
    hidden?: boolean;
    /** Item 外层 wrapper(tr) 的类名（仅 vertical 有 tr 时生效）。 */
    class?: string | undefined;
    /** Item 外层 wrapper(tr) 的内联样式。 */
    style?: string | undefined;
    /** 跨列数。 */
    span?: number | undefined;
    /** key 的自定义样式（宽度、对齐等）。 */
    keyStyle?: string | undefined;
    children?: Snippet;
  }

  let {
    itemKey,
    hidden = false,
    class: className,
    style,
    span,
    keyStyle,
    children,
  }: Props = $props();

  const ctx = getDescriptionsContext();
  const align = $derived(ctx?.getAlign() ?? 'center');
  const layout = $derived(ctx?.getLayout() ?? 'vertical');
</script>

{#if !hidden}
  {#snippet plainCell()}
    <td class="cd-descriptions-item" colspan={span || 1}>
      <span class="cd-descriptions-key" style={keyStyle}>{itemKey}:</span>
      <span class="cd-descriptions-value">{@render children?.()}</span>
    </td>
  {/snippet}

  {#snippet alignCell()}
    <th class="cd-descriptions-item cd-descriptions-item-th">
      <span class="cd-descriptions-key" style={keyStyle}>{itemKey}</span>
    </th>
    <td
      class="cd-descriptions-item cd-descriptions-item-td"
      colspan={span ? span * 2 - 1 : 1}
    >
      <span class="cd-descriptions-value">{@render children?.()}</span>
    </td>
  {/snippet}

  {#if layout === 'horizontal'}
    {#if align === 'plain'}{@render plainCell()}{:else}{@render alignCell()}{/if}
  {:else}
    <tr class={className} {style}>
      {#if align === 'plain'}{@render plainCell()}{:else}{@render alignCell()}{/if}
    </tr>
  {/if}
{/if}
