<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';

  const defaultValue = 'Line 1\nLine 2\n这是一行较长的文本，用来演示软换行时的行号对齐效果。\nLine 4\nLine 5';
</script>

<TextArea
  showLineNumber
  lineNumberStart={1}
  {defaultValue}
  rows={12}
  style="width: 420px;"
  lineNumberStyle="color: var(--cd-color-text-2);"
/>
