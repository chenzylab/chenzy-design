<script lang="ts">
  // 具名图标自带尺寸、旋转、spin 功能（对齐 Semi）。
  import { IconHome, IconEmoji, IconSpin } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 16px; align-items: center; font-size: 24px;">
  <IconHome size="small" />
  <IconEmoji rotate={180} />
  <IconSpin spin />
</div>
