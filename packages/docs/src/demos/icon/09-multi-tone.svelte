<script lang="ts">
  // 多色图标：四色渐变，缺省用默认多彩色，也可通过 fill 传 string[] 自定义（对齐 Semi）。
  import { IconAIBellLevel3, IconAIWandLevel3, IconAIFilledLevel3 } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <IconAIBellLevel3 size="extra-large" />
  <IconAIWandLevel3
    fill={[
      'var(--cd-color-danger)',
      'var(--cd-color-success)',
      'var(--cd-color-primary)',
      'var(--cd-color-warning)',
    ]}
    size="extra-large"
  />
  <IconAIFilledLevel3
    fill={['var(--cd-color-primary)', 'var(--cd-color-success)']}
    size="extra-large"
  />
</div>
