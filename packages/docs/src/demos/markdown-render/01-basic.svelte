<script lang="ts">
  import { MarkdownRender } from '@chenzy-design/svelte';

  const raw = `# 标题一

这是一段普通正文，支持 **加粗**、*斜体* 和 [链接](https://example.com)。

- 列表项一
- 列表项二
- 列表项三

> 引用块：用于强调一段话。`;
</script>

<MarkdownRender {raw} />
