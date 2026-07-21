<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Text
    ellipsis={{ showTooltip: { opts: { content: '架构|Semi-inf|graph.cheet.relation' } } }}
    style="width: 150px;"
  >
    有问题的超长文本发生截断时可按需进行自定义配置
  </Text>

  <Text
    ellipsis={{
      showTooltip: {
        opts: { content: '架构|Semi-inf|graph.cheet.relation', className: 'cd-typography-demo-wordbreak' },
      },
    }}
    style="width: 150px;"
  >
    覆盖类名超长文本发生截断时可使用类名覆盖进行自定义配置
  </Text>

  <Text
    ellipsis={{
      showTooltip: {
        opts: { content: '架构|Semi-inf|graph.cheet.relation', style: 'word-break: break-all;' },
      },
    }}
    style="width: 150px;"
  >
    覆盖 style 超长文本发生截断时可使用 style 进行自定义配置
  </Text>
</div>

<!-- 按需配置 word-break（对齐 Semi 的 .components-typography-demo scss）。 -->
<style>
  :global(.cd-typography-demo-wordbreak) {
    word-break: break-word;
  }
</style>
