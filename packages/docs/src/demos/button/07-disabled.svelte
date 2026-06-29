<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<!-- 禁用态：各 theme/type 组合下统一降低不透明度、禁止交互（对齐 Semi） -->
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Button disabled>禁用</Button>
  <Button disabled theme="borderless">无背景禁用</Button>
  <Button disabled theme="light">浅色禁用</Button>
  <Button disabled theme="borderless" type="primary">无背景主要禁用</Button>
  <Button disabled theme="solid" type="warning">深色警告禁用</Button>
</div>
