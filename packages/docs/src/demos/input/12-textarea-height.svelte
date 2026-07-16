<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:16px;max-width:420px">
  <!-- textareaStyle 设置内部 textarea 元素样式（高度、背景等） -->
  <TextArea textareaStyle="height:120px" placeholder="高度 120px" />
  <TextArea
    textareaStyle="height:160px;background-color:var(--cd-color-fill-0)"
    placeholder="高度 160px，浅色背景"
  />
  <!-- style 控制外层容器，textareaStyle 控制 textarea 元素 -->
  <TextArea
    style="border:2px solid var(--cd-color-primary)"
    textareaStyle="height:100px"
    placeholder="style 控制外层容器，textareaStyle 控制 textarea"
  />
</div>
