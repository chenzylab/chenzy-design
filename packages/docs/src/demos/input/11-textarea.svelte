<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:16px;max-width:420px">
  <!-- 多行输入框基础用法：maxCount 字数限制 + showClear 清除 -->
  <TextArea placeholder="请输入多行文本" />
  <TextArea placeholder="maxCount=100，右下角计数，支持清除" maxCount={100} showClear />
</div>
