<script lang="ts">
  import {
    IconInfoCircle,
    IconTickCircle,
    IconAlertTriangle,
    IconAlertCircle,
    IconSpin,
  } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
  <!-- 单色图标继承外层 color；用 style 应用语义色 -->
  <IconInfoCircle style="color: var(--cd-color-info);" />
  <IconTickCircle style="color: var(--cd-color-success);" />
  <IconAlertTriangle style="color: var(--cd-color-warning);" />
  <IconAlertCircle style="color: var(--cd-color-danger);" />
  <!-- spin 属性使图标持续旋转，受 reduced-motion 抑制 -->
  <IconSpin spin />
</div>
