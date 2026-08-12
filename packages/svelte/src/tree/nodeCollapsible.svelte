<!--
  NodeCollapsible — 对齐 Semi Design `nodeCollapsible.tsx`。
  包一层 Collapsible 做子树整体高度收缩/展开过渡：挂载时先反转 isOpen 再在下一宏任务翻回目标值，
  确保 Collapsible 先量出内容真实高度再触发过渡（对齐 Semi「ComponentDidMount 时 domHeight 还没给出」注释）。
  nodeList.svelte 用它包裹「本次 hide/show 的一段过渡节点」，过渡结束回调 onMotionEnd 供上层清空 motionKeys。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Collapsible from '../collapsible/Collapsible.svelte';

  interface Props {
    open?: boolean;
    motion?: boolean;
    duration?: number;
    onMotionEnd?: () => void;
    children?: Snippet;
  }

  const { open = false, motion = true, duration = 200, onMotionEnd, children }: Props = $props();

  // svelte-ignore state_referenced_locally
  let isOpen = $state(!open);

  $effect(() => {
    const timer = setTimeout(() => {
      isOpen = !open;
    }, 0);
    return () => clearTimeout(timer);
  });
</script>

<Collapsible {isOpen} {motion} {duration} {onMotionEnd}>
  {@render children?.()}
</Collapsible>
