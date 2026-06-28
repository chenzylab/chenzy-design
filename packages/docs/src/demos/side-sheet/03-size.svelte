<script lang="ts">
  import { SideSheet, Button, Text } from '@chenzy-design/svelte';

  let small = $state(false);
  let large = $state(false);
  let custom = $state(false);
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => (small = true)}>small 预设</Button>
  <Button type="primary" onclick={() => (large = true)}>large 预设</Button>
  <Button onclick={() => (custom = true)}>width 自定义</Button>
</div>

<SideSheet
  open={small}
  placement="right"
  size="small"
  title="size = small"
  onOpenChange={(e) => (small = e.open)}
>
  <Text>small 预设宽度，适合轻量详情或快捷设置。</Text>
</SideSheet>

<SideSheet
  open={large}
  placement="right"
  size="large"
  title="size = large"
  onOpenChange={(e) => (large = e.open)}
>
  <Text>large 预设宽度，适合复杂表单或多列内容。</Text>
</SideSheet>

<SideSheet
  open={custom}
  placement="right"
  width={560}
  title="width = 560"
  onOpenChange={(e) => (custom = e.open)}
>
  <Text>width 显式数值优先于 size 预设（横向取 width，纵向取 height）。</Text>
</SideSheet>
