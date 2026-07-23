<script lang="ts">
  // 单色图标自动继承外部容器 CSS 的 color 属性；
  // 也可通过给 Icon 设置 style 来修改图标的颜色（严格复刻 Semi 颜色 demo）。
  import { IconLikeHeart, IconFlag, IconLock, IconUnlock } from '@chenzy-design/icons';
</script>

<div>
  <div style="color: #E91E63;">
    <IconLikeHeart size="extra-large" />
    <IconFlag size="extra-large" />
  </div>
  <br />
  <div>
    <IconLock style="color: #6A3AC7" size="extra-large" />
    <IconUnlock style="color: #9C27B0" size="extra-large" />
  </div>
</div>
