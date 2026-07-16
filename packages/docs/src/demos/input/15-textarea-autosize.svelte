<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:16px;max-width:420px">
  <!-- autosize：高度随内容自动增长 -->
  <TextArea autosize rows={1} placeholder="autosize：输入换行高度自动增长" />
  <!-- autosize 限定最小/最大行数，超出滚动 -->
  <TextArea autosize={{ minRows: 1, maxRows: 3 }} placeholder="minRows=1 maxRows=3，超出滚动" />
  <!-- autosize 搭配 maxCount 计数 -->
  <TextArea autosize maxCount={100} showCount placeholder="autosize + maxCount=100" />
</div>
