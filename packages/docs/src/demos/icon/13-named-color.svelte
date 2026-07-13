<script lang="ts">
  // 单色图标自动继承外部容器 CSS color；也可通过 style 修改图标颜色（对齐 Semi）。
  import { IconLikeHeart, IconFlag, IconLock, IconUnlock } from '@chenzy-design/icons';
</script>

<div>
  <div style="color: #E91E63; font-size: 24px;">
    <IconLikeHeart size="extra-large" />
    <IconFlag size="extra-large" />
  </div>
  <br />
  <div style="font-size: 24px;">
    <IconLock style="color: #6A3AC7" size="extra-large" />
    <IconUnlock style="color: #9C27B0" size="extra-large" />
  </div>
</div>
