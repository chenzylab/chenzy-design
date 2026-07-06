<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<div>
  <p style="color: var(--cd-color-text-2); font-size: 13px; margin: 0 0 8px;">
    collapseHeight=60：折叠时保留 60px 高度做「展开更多」，点击按钮展开全文。
  </p>
  <Collapsible isOpen={open} collapseHeight={60}>
    <div style="padding: 12px; background: var(--cd-color-fill-0); border-radius: 6px;">
      <p>这是一段较长的文本。折叠态只保留部分高度作为预览，其余内容被截断隐藏。</p>
      <p>点击「展开更多」后完整呈现。这种模式常用于评论、简介、协议条款等场景。</p>
      <p>collapseHeight&gt;0 时组件改用显式高度过渡 + JS 测高（内容变化经 reCalcKey 重测）。</p>
    </div>
  </Collapsible>
  <Button style="margin-top: 8px;" onclick={() => (open = !open)}>
    {open ? '收起' : '展开更多'}
  </Button>
</div>
