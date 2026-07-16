<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';

  const sample = `Line 1
Line 2
这是一行较长的文本，用来演示软换行时的行号对齐效果。
Line 4
Line 5`;
</script>

<div style="max-width:440px">
  <!-- showLineNumber 展示行号；lineNumberStart 设置起始行号，lineNumberStyle 自定义行号区样式 -->
  <TextArea
    showLineNumber
    lineNumberStart={1}
    defaultValue={sample}
    rows={10}
    lineNumberStyle="color:var(--cd-color-text-2)"
  />
</div>
