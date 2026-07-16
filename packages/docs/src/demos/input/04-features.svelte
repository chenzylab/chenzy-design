<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <!-- showClear：有内容且 hover/focus 时点击图标清空 -->
  <Input showClear defaultValue="点击右侧图标清除" placeholder="showClear" />
  <!-- showCount + maxLength：字数统计 + 长度限制 -->
  <Input showCount maxLength={20} placeholder="最多 20 个字符" />
  <!-- mode="password"：密码显隐切换 -->
  <Input mode="password" defaultValue="123456" placeholder="密码输入" />
</div>
