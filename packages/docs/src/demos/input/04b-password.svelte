<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <!-- mode="password"：末尾图标切换明文/密文 -->
  <Input mode="password" defaultValue="123456" placeholder="请输入密码" />
  <Input mode="password" showClear defaultValue="密码 + 清除" />
</div>
