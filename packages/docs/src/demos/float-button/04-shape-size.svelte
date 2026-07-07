<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">形状（round=正圆 / square=方形）与尺寸（small / default / large）。此处用 static 定位以便并排预览。</Text>
<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:8px">
  {#each [['small', '小'], ['default', '中'], ['large', '大']] as [size, label] (size)}
    <FloatButton ariaLabel={`${label}正圆`} size={size as 'small' | 'default' | 'large'} shape="round" style="position:static">
      {#snippet icon()}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>
      {/snippet}
    </FloatButton>
  {/each}
  <FloatButton ariaLabel="方形" shape="square" style="position:static">
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="12" height="12" fill="currentColor" /></svg>
    {/snippet}
  </FloatButton>
</div>
