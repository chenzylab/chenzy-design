<script lang="ts">
  // 严格复刻 Semi「限制拖动范围」demo：300×300 grey-2 容器（relative）+ Constrainer 标签，
  // 内含 80×80 主色方块，初始 top/left 80；constrainer 返回该容器元素。
  import { DragMove } from '@chenzy-design/svelte';

  let containerEl = $state<HTMLElement | null>(null);
</script>

<div
  bind:this={containerEl}
  style="background-color: var(--cd-color-grey-2); width: 300px; height: 300px;
    padding: 5px; position: relative;
    color: var(--cd-color-white); font-weight: 500;"
>
  <span>Constrainer</span>
  <!-- 初始 top/left 落在包裹层（本库由 core 强制 absolute 的就是它），方块本身保持 static。 -->
  <DragMove constrainer={() => containerEl} style="top: 80px; left: 80px;">
    <div
      style="background-color: var(--cd-color-primary); width: 80px; height: 80px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;"
    >
      Drag me
    </div>
  </DragMove>
</div>
