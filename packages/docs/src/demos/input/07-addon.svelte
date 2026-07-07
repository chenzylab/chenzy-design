<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;max-width:360px">
  <!-- addonBefore / addonAfter 在输入框外拼接前置/后置标签 -->
  <Input addonBefore="https://" addonAfter=".com" placeholder="站点域名" />
  <Input addonBefore="用户名" placeholder="请输入" />
</div>
