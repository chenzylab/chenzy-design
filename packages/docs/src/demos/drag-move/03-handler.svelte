<script lang="ts">
  // 严格复刻 Semi「自定义触发拖动的元素」demo：300×300 grey-2 容器 + Constrainer 标签，
  // 80×80 主色方块内嵌 IconTransparentStroked 作把手，仅点击该图标可拖动。
  import { DragMove } from '@chenzy-design/svelte';
  import { IconTransparentStroked } from '@chenzy-design/icons';

  let containerEl = $state<HTMLElement | null>(null);
  let handlerEl = $state<HTMLElement | null>(null);
</script>

<div
  bind:this={containerEl}
  style="background-color: var(--cd-color-grey-2); width: 300px; height: 300px;
    padding: 5px; position: relative;
    color: var(--cd-color-white); font-weight: 500;"
>
  <span>Constrainer</span>
  <DragMove
    handler={() => handlerEl!}
    constrainer={() => containerEl}
    style="top: 50px; left: 50px;"
  >
    <div
      style="background-color: var(--cd-color-primary); width: 80px; height: 80px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;"
    >
      <div bind:this={handlerEl} style="width: fit-content; height: fit-content;">
        <IconTransparentStroked size="large" />
      </div>
    </div>
  </DragMove>
</div>
