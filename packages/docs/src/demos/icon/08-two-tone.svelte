<script lang="ts">
  // 双色图标：通过 fill 属性设置颜色，支持 string 与 string[]（严格复刻 Semi）。
  import { IconAIWandLevel2, IconAIFilledLevel2 } from '@chenzy-design/icons';
</script>

<div>
  <IconAIWandLevel2
    fill={['var(--cd-color-danger)', 'var(--cd-color-success)']}
    style="margin-right: 10px;"
    size="extra-large"
  />
  <IconAIFilledLevel2 fill="var(--cd-color-success)" size="extra-large" />
</div>
