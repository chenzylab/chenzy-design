<script lang="ts">
  // 对齐 Semi「仅纯 Markdown」：传 format="md" 开启仅 Markdown 模式，无需转义特殊字符。
  // 同时用 components 覆盖 h1 为主色标题。（本库仅支持 md 模式，Svelte 无 jsx-runtime。）
  import { MarkdownRender } from '@chenzy-design/svelte';
  import CustomH1 from './CustomH1.svelte';

  const raw = `# 无需转义的符号 {} <> ...`;
</script>

<MarkdownRender {raw} format="md" components={{ h1: CustomH1 }} />
