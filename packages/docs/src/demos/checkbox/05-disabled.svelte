<script lang="ts">
  import { Checkbox } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
  <!-- disabled 禁用态，禁用时不可聚焦、不可切换 -->
  <Checkbox disabled>未选中 · 禁用</Checkbox>
  <Checkbox defaultChecked disabled>已选中 · 禁用</Checkbox>
</div>
