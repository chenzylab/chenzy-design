<!--
  Descriptions.Item — 镜像 Semi descriptions/item.tsx。
  三种单元格形态：
    - plain（align==='plain'）：单个 <td.item colspan={span}>，key 后内联冒号，key 与 value 同排。
    - 非 plain：<th.item.item-th>（key）+ <td.item.item-td colspan={span?span*2-1:1}>（value）成对。
  外层包裹：
    - layout==='vertical'：每个 Item 自成一行 <tr>。
    - layout==='horizontal' 且父级传了 data：不包 tr（由父 Descriptions 的行分组循环提供 <tr>），只渲裸单元格。
    - layout==='horizontal' 且父级为 children 收集模式（无 data）：向父级注册元信息、自身不渲染 DOM，
      由父级按 getHorizontalList 统一分组渲染（对齐 Semi getColumns 从 React children 提取后走同一分组逻辑）。
  hidden 为 true 时不渲染（对齐 Semi）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
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

  const uid = $props.id();
  const ctx = getDescriptionsContext();
  const align = $derived(ctx?.getAlign() ?? 'center');
  const layout = $derived(ctx?.getLayout() ?? 'vertical');
  // 父级「horizontal + children 收集模式」下接管渲染，本组件保持静默；其余场景照常自渲染。
  const collected = $derived(ctx?.isCollecting() ?? false);

  // 上报元信息交由父级统一分组渲染（对齐 Semi getColumns 从 children 提取）。
  // 仅在 init 期同步注册一次（非 $effect）：
  //  1) docs 站点走 prerender/SSR，$effect 不会执行，若延迟到 $effect 会导致 horizontal+children
  //     组合在构建产物中渲染成空表格；
  //  2) 若改用 $effect 注册，父级 registerItem 写 version($state) 会触发父级模板（含本 children 渲染位）
  //     重新求值，子组件随之重新执行 $effect 再次写 version，形成 effect_update_depth_exceeded 死循环
  //     （同 Table Column 收集模式踩过的红线：register 必须是不读自身触发源的纯写，且只在 init 期做一次）。
  // 代价：itemKey/span/keyStyle/hidden 后续变化不会更新已注册的分组快照——声明式 children 数据通常静态，可接受。
  // untrack：显式声明「故意只读一次初始值、不建立响应式依赖」（同 TabPane buildReg 注册模式）。
  if (untrack(() => collected)) {
    untrack(() => ctx?.registerItem(uid, { itemKey, hidden, span, keyStyle, children }));
  }
</script>

{#if !hidden && !collected}
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
