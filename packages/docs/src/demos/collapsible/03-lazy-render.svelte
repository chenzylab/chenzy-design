<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<div>
  <Button onclick={() => (open = !open)}>
    {open ? '收起' : '展开'}
  </Button>
  <p style="color: var(--cd-color-text-2); font-size: 13px; margin: 8px 0;">
    lazyRender + keepDOM：首次展开前不渲染内容（省首屏成本），首展后保留 DOM。
  </p>
  <Collapsible isOpen={open} lazyRender keepDOM>
    <div style="padding: 12px; background: var(--cd-color-fill-0); border-radius: 6px;">
      <p>这段内容在首次展开前不会渲染。首展后即便折叠也保留在 DOM 里。</p>
    </div>
  </Collapsible>
</div>
