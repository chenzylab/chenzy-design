<script lang="ts">
  // 双色图标：通过 fill 属性设置颜色，支持 string 与 string[]（对齐 Semi）。
  import { IconAIWandLevel2, IconAIFilledLevel2 } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <IconAIWandLevel2
    fill={['var(--cd-color-danger)', 'var(--cd-color-success)']}
    size="extra-large"
  />
  <IconAIFilledLevel2 fill="var(--cd-color-success)" size="extra-large" />
</div>
