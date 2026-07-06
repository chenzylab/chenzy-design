<script lang="ts">
  import { Collapsible, Button, Input } from '@chenzy-design/svelte';

  let open = $state(true);
</script>

<div>
  <Button onclick={() => (open = !open)}>
    {open ? '收起' : '展开'}
  </Button>
  <p style="color: var(--cd-color-text-2); font-size: 13px; margin: 8px 0;">
    keepDOM=true：折叠后内容 DOM 不卸载，输入框内容/滚动位置得以保留。
  </p>
  <Collapsible isOpen={open} keepDOM>
    <div style="padding: 12px; background: var(--cd-color-fill-0); border-radius: 6px;">
      <Input placeholder="输入点内容，折叠再展开仍在" />
    </div>
  </Collapsible>
</div>
