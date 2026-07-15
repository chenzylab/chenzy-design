<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  // id 会被设置到内容元素，配合触发器的 aria-controls 指明控制关系（对齐 Semi Accessibility 示例）。
  const collapseId = 'myCollapsible';
  let visible = $state(false);
</script>

<div>
  <Button onclick={() => (visible = !visible)} aria-controls={collapseId} aria-expanded={visible}>
    {visible ? 'hide' : 'show'}
  </Button>
  <Collapsible isOpen={visible} id={collapseId}>
    <div style="padding: 12px; margin-top: 8px; background: var(--cd-color-fill-0); border-radius: 6px; color: var(--cd-color-text-1);">
      hide content
    </div>
  </Collapsible>
</div>
