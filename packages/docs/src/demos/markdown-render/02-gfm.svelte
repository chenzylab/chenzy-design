<script lang="ts">
  import { MarkdownRender } from '@chenzy-design/svelte';

  const raw = `## GFM 扩展语法

| 组件 | 类型 | 状态 |
| --- | --- | --- |
| CodeHighlight | 展示 | 已完成 |
| MarkdownRender | 展示 | 已完成 |

任务列表：

- [x] 已完成的任务
- [ ] 待办的任务

支持 ~~删除线~~ 与自动链接 https://example.com`;
</script>

<MarkdownRender {raw} remarkGfm />
