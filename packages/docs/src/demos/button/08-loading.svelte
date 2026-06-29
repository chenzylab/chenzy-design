<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<!-- 加载态：自动带旋转图标并禁止点击；可与文字或纯图标组合 -->
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Button type="primary" loading>加载中</Button>
  <Button type="primary" theme="light" loading>处理中</Button>
  <Button type="primary" theme="outline" loading>提交中</Button>
  <Button type="primary" loading ariaLabel="加载中" />
</div>
