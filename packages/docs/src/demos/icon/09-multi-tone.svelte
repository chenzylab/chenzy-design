<script lang="ts">
  // 多色图标：当前的多色按钮可传入四个颜色。通过 fill 属性设置颜色，
  // 支持 string 与 string[]（严格复刻 Semi）。
  import { IconAIBellLevel3, IconAIWandLevel3, IconAIFilledLevel3 } from '@chenzy-design/icons';
</script>

<div>
  <IconAIBellLevel3 style="margin-right: 10px;" size="extra-large" />
  <IconAIWandLevel3
    fill={[
      'var(--cd-color-danger)',
      'var(--cd-color-success)',
      'var(--cd-color-primary)',
      'var(--cd-color-warning)',
    ]}
    style="margin-right: 10px;"
    size="extra-large"
  />
  <IconAIFilledLevel3
    fill={['var(--cd-color-primary)', 'var(--cd-color-success)']}
    size="extra-large"
  />
</div>
