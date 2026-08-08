<script lang="ts">
  // 严格复刻 Semi「基本用法」demo：80×80 主色方块、白字、圆角 10、文案 Drag me。
  //
  // 与 Semi 的一处必要差异：Semi 把 position:absolute 加在方块自身（它 cloneElement 到
  // children，无包裹层）；本库渲染一层包裹元素并由 core 强制其 absolute（包裹层即 Semi 的
  // "element"），故 absolute 归包裹层，方块本身保持 static —— 否则方块脱离包裹层，
  // 包裹层塌成 0×0、撑不起 DemoBox，方块会溢出容器。
  import { DragMove } from '@chenzy-design/svelte';
</script>

<div style="position: relative; height: 160px;">
  <DragMove>
    <div
      style="background-color: var(--cd-color-primary); width: 80px; height: 80px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 10px; font-weight: 500;
        color: var(--cd-color-white);"
    >
      Drag me
    </div>
  </DragMove>
</div>
