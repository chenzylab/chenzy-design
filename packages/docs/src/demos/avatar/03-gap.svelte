<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<!-- 字符头像字号随宽度自适应；gap 控制字符距左右两侧的像素 -->
<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <Avatar alt="AS">AS</Avatar>
  <Avatar gap={4} alt="Semi">Semi</Avatar>
  <Avatar gap={10} alt="Semi">Semi</Avatar>
</div>
