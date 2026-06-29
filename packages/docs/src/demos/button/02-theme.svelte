<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<!-- 四种主题（填充方式）一览，默认 light -->
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Button type="primary" theme="light">light</Button>
  <Button type="primary" theme="solid">solid</Button>
  <Button type="primary" theme="borderless">borderless</Button>
  <Button type="primary" theme="outline">outline</Button>
</div>
