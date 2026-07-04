<script lang="ts">
  import { MarkdownRender } from '@chenzy-design/svelte';

  const raw = `## 代码块

正文中的行内 \`code\` 与代码块：

\`\`\`javascript
function sum(a, b) {
  return a + b;
}
\`\`\`

代码块默认接入 CodeHighlight 做语法高亮。`;
</script>

<MarkdownRender {raw} />
