<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">形状：round=正圆（默认）/ square=方形（8px 圆角）。此处用 static 定位以便并排预览。</Text>
<div style="display:flex; gap:16px; align-items:center; margin-top:8px">
  <FloatButton shape="round" style="position:static">
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>
    {/snippet}
  </FloatButton>
  <FloatButton shape="square" style="position:static">
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="12" height="12" fill="currentColor" /></svg>
    {/snippet}
  </FloatButton>
</div>
