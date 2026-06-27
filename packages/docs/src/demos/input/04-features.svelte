<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <Input clearable defaultValue="可清除内容" placeholder="clearable" />
  <Input showCount maxLength={20} placeholder="最多 20 个字符" />
  <Input type="password" defaultValue="123456" placeholder="密码输入" />
</div>
