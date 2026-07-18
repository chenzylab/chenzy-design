<script lang="ts">
  // 对齐 Semi「修改元素样式」：向 components 传入渲染组件覆盖任意元素。
  // 这里把所有 h2 标题替换为自定义颜色的 Title。
  import { MarkdownRender } from '@chenzy-design/svelte';
  import CustomH2 from './CustomH2.svelte';

  const raw = `## 从 Semi Design 到 Any Design  快速定义你的设计系统，并应用在设计稿和代码中`;
</script>

<MarkdownRender {raw} components={{ h2: CustomH2 }} />
