<script lang="ts">
  import { MarkdownRender } from '@chenzy-design/svelte';

  // 对齐 Semi 基本用法：富文本（加粗/删除线/链接/emoji）+ 多级标题 + 列表 + 表格。
  const raw = `## 从 Semi Design 到 Any Design

正文内容是普通的文本，也可以**加粗**~~删除线~~和 [超链接](https://semi.design) 等 Markdown 基本语法所支持的富文本，也支持 emoji 🍰

---

#### MarkdownRender 渲染列表语法

- 好好地吃饭
- 好好地睡觉
- 好好地游玩
- 好好地学习

| 支持 | Markdown 表格 | c | d |
| - | :- | -: | :-: |
| 1 | 2 | 3 | 4 |
| 21 | 22 | 23 | 24 |
| 31 | 32 | 33 | 34 |`;
</script>

<MarkdownRender {raw} />
