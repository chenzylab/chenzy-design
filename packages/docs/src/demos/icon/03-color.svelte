<script lang="ts">
  import { IconLikeHeart, IconLock } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
  <!-- 单色图标自动继承外层容器的 color -->
  <div style="color: #e91e63; display: flex; gap: 12px;">
    <IconLikeHeart size="extra-large" />
    <IconLock size="extra-large" />
  </div>
  <!-- 通过 style 显式改色 -->
  <IconLock size="extra-large" style="color: #6a3ac7;" />
  <IconLikeHeart size="extra-large" style="color: #00b42a;" />
</div>
