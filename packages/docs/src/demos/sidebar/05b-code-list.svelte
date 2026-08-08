<script lang="ts">
  // 对齐 Semi「代码列表」段：用 SideBarCodeContent 直接展示代码列表信息
  // （不套 SideBarContainer，独立可用）。
  import { SideBarCodeContent } from '@chenzy-design/svelte';
  import type { CodeItemProps } from '@chenzy-design/svelte';

  const codes: CodeItemProps[] = [
    {
      key: 'tool_call',
      name: 'tool_call.json',
      isJson: true,
      content: JSON.stringify(
        { name: 'search_web', arguments: { query: 'Svelte 5 runes', top_k: 5 } },
        null,
        2,
      ),
    },
    {
      key: 'snippet',
      name: 'snippet.ts',
      language: 'typescript',
      content: `export function sum(a: number, b: number): number {\n  return a + b;\n}`,
    },
  ];
</script>

<SideBarCodeContent {codes} />
