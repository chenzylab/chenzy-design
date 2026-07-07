<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';

  // shape 除 round（正圆）/ square（方形）外，还接受任意 CSS border-radius 字符串，
  // 自定义圆角程度（本库相较 Semi 额外提供）。此处用 static 定位以便并排预览。
  const shapes: { shape: string; label: string }[] = [
    { shape: 'round', label: 'round（正圆）' },
    { shape: 'square', label: 'square' },
    { shape: '8px', label: '8px' },
    { shape: '30%', label: '30%' },
  ];
</script>

<Text type="tertiary">shape 支持任意 border-radius 字符串（如 8px / 30%），在正圆与方形之间自由过渡。</Text>
<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:8px">
  {#each shapes as { shape, label } (shape)}
    <div style="display:flex; flex-direction:column; align-items:center; gap:6px">
      <FloatButton ariaLabel={label} {shape} style="position:static">
        {#snippet icon()}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>
        {/snippet}
      </FloatButton>
      <Text type="tertiary" size="small">{label}</Text>
    </div>
  {/each}
</div>
