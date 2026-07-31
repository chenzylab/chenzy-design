<script lang="ts">
  // 严格复刻 Semi「自定义拖动后的位置处理」demo：
  // customMove 在色块靠近右边界时改用 right 定位（left 置 auto），保证点击改变宽度后
  // 色块仍不超出 constrainer 范围；点击（按下抬起位移 < 5px）在 60/100px 间切换宽度。
  import { DragMove } from '@chenzy-design/svelte';

  let containerEl = $state<HTMLElement | null>(null);
  let elementEl: HTMLElement | null = null;
  let startPoint: { x: number; y: number } | null = null;

  function customMove(element: HTMLElement, top: number, left: number) {
    if (containerEl && left + 100 > containerEl.offsetWidth) {
      element.style.right = `${containerEl.offsetWidth - left - element.offsetWidth}px`;
      element.style.left = 'auto';
    } else {
      element.style.left = `${left}px`;
    }
    element.style.top = `${top}px`;
  }

  function onMouseDown(e: MouseEvent) {
    startPoint = { x: e.clientX, y: e.clientY };
    // 组件不暴露 ref：从事件目标往上找包裹层（本库由 core 强制 absolute 的就是它），
    // 点击改宽度作用在它身上。mousedown 一定先于 mouseup，故这里取到即可。
    elementEl = (e.target as HTMLElement | null)?.closest('.cd-drag-move') ?? null;
  }

  function onMouseUp(e: MouseEvent) {
    if (startPoint && elementEl) {
      const { x, y } = startPoint;
      if (Math.abs(e.clientX - x) < 5 && Math.abs(e.clientY - y) < 5) {
        elementEl.style.width = elementEl.style.width === '60px' ? '100px' : '60px';
      }
    }
    startPoint = null;
  }
</script>

<span>蓝色色块点击可改变宽度，改变前后蓝色色块均不会超出范围限制</span>
<br /><br />
<div
  bind:this={containerEl}
  style="background-color: var(--cd-color-grey-2); width: 300px; height: 300px;
    position: relative; padding: 10px;
    color: var(--cd-color-white); font-weight: 500;"
>
  <span>Constrainer</span>
  <!-- customMove 收到的 element 是包裹层（本库由 core 强制 absolute 的就是它），
       故初始 top/left 与点击改宽度都作用在包裹层上。 -->
  <DragMove
    constrainer={() => containerEl}
    {customMove}
    {onMouseDown}
    {onMouseUp}
    style="top: 50px; left: 50px; width: 60px;"
  >
    <div
      style="background-color: var(--cd-color-primary); width: 100%; height: 50px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 10px; padding: 5px; box-sizing: border-box;"
    >
      Drag me
    </div>
  </DragMove>
</div>
