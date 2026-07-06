<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<div>
  <Button onclick={() => (open = !open)}>
    {open ? '收起' : '展开'}
  </Button>
  <Collapsible isOpen={open}>
    <div style="padding: 12px; margin-top: 8px; background: var(--cd-color-fill-0); border-radius: 6px;">
      <p>Collapsible 是折叠容器原语，通过 isOpen 控制展开/折叠，带高度过渡动画。</p>
      <p>默认用 CSS grid 自适应折叠，内容高度无需 JS 测量。</p>
    </div>
  </Collapsible>
</div>
