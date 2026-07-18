<script lang="ts">
  import { CodeHighlight } from '@chenzy-design/svelte';
  // 设置 defaultTheme={false} 关闭默认主题，再手动引入所需主题的 css 文件即可。
  // 一些主题可在 node_modules 内 prismjs/themes 下找到，也可在网上搜索其他中意的主题。

  const code = `function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;
</script>

<CodeHighlight language="javascript" {code} defaultTheme={false} />
