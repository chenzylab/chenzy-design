<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<div>
  <Button onclick={() => (open = !open)}>
    {open ? '收起' : '展开'}
  </Button>
  <p style="color: var(--cd-color-text-2); font-size: 13px; margin: 8px 0;">
    fade=true：折叠/展开时叠加透明度渐变，过渡更柔和。
  </p>
  <Collapsible isOpen={open} fade>
    <div style="padding: 12px; background: var(--cd-color-fill-0); border-radius: 6px;">
      <p>展开时淡入、折叠时淡出，配合高度过渡。</p>
    </div>
  </Collapsible>
</div>
