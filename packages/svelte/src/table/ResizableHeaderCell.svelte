<!--
  ResizableHeaderCell — 列宽拖拽手柄（对齐 Semi table/ResizableHeaderCell.tsx 文件结构）。

  Semi 版本用 react-resizable 的 <Resizable> 包一层 <th>，本身职责是「resize 手柄的
  渲染与事件绑定」，不持有拖拽状态（那是 ResizableTable.tsx 的职责）。本库同构：
  handle 本身是薄包装 —— 拖拽状态（widthOverrides/resizingKey）与手势处理
  （startResize，命令式 pointer 事件 + document 级监听，见 Table.svelte 红线 #3
  注释）留在 Table.svelte，本组件只接收「是否可拖拽」与回调，渲染 handle 元素。

  与 Semi 的差异：Semi 用整棵 <Resizable> 包住 <th>（React 需要这层才能对齐
  components.header.cell 自定义覆盖机制）；Svelte 无需组件包裹即可用 Snippet
  向内容区插入 handle 元素，故这里改为「resize handle 自身」而非「th 的包装层」——
  TableHeaderRow.svelte 在 <th> 内直接渲染这个 handle（对齐 Semi
  <th>{children}<Resizable/></th> 的视觉结果：handle 是 th 的子元素，非父元素）。
  保留独立文件对齐 Semi 文件结构标准，即使本库语境下这层更薄。
-->
<script lang="ts">
  let {
    resizable,
    resizing = false,
    ariaLabel,
    onPointerDown,
    onHandleEl,
  }: {
    resizable: boolean;
    resizing?: boolean;
    ariaLabel: string;
    onPointerDown: (e: PointerEvent) => void;
    /** handle DOM 节点回调（对齐 bind:this 语义）。用回调而非 bind:/$bindable——调用方
     *  resizeHandles[colKey] 首次求值为 undefined（Record 初始空对象），Svelte 5
     *  $bindable fallback 值场景禁止 bind:x={undefined}，回调式规避此限制
     *  （同 TableHeaderRow.svelte 的 onRowEl 处理方式）。 */
    onHandleEl?: (el: HTMLElement | null) => void;
  } = $props();

  let handleElLocal = $state<HTMLElement | null>(null);
  $effect(() => {
    onHandleEl?.(handleElLocal);
  });
</script>

{#if resizable}
  <span
    class="react-resizable-handle"
    class:resizing
    role="separator"
    aria-orientation="vertical"
    aria-label={ariaLabel}
    bind:this={handleElLocal}
    onpointerdown={onPointerDown}
  ></span>
{/if}

<style>
  /* 手柄定位基准由父级 <th> 的 .cd-table-row-head-resizable { position: relative }
     提供（挂载点在 TableHeaderRow.svelte，规则也留在该文件）。 */
  .react-resizable-handle {
    position: absolute;
    width: var(--cd-width-table-react-resizable-handle);
    height: calc(100% - var(--cd-spacing-table-resizable-offset-y) * 2);
    bottom: var(--cd-spacing-table-resizable-bottom);
    right: var(--cd-spacing-table-react-resizable-handle-right);
    cursor: col-resize;
    z-index: 0;
    touch-action: none;
    user-select: none;
    background-color: var(--cd-color-table-border-default);
  }
  .react-resizable-handle:hover {
    background-color: var(--cd-color-table-resizer-bg-default);
  }
  /* bordered 表格：手柄恒透明（默认 + hover 都透明），对齐 Semi table.scss &-bordered 内
     `.react-resizable-handle { background: transparent }`（无 hover 变色，该规则特异性
     覆盖了非 bordered 的 handle:hover primary 蓝）。列分隔靠单元格 border-right，
     避免灰手柄条/hover 蓝竖条 + 边框双重竖线。祖先 .cd-table-bordered 在 Table.svelte
     的 wrapper 上，跨组件须 :global()。 */
  :global(.cd-table-bordered) .react-resizable-handle,
  :global(.cd-table-bordered) .react-resizable-handle:hover {
    background-color: transparent;
  }

  /* RTL（对齐 Semi rtl.scss `.react-resizable-handle { right: auto; left: ... }`）：
     手柄从右边移到左边，同一个 right 偏移量复用（Semi 未额外定义镜像专用变量）。
     .cd-table-wrapper-rtl 挂在 Table.svelte 的最外层 wrapper 上，跨组件须 :global()。 */
  :global(.cd-table-wrapper-rtl) .react-resizable-handle {
    right: auto;
    left: var(--cd-spacing-table-react-resizable-handle-right);
  }

  @media (prefers-reduced-motion: reduce) {
    .react-resizable-handle {
      transition: none;
    }
  }
</style>
