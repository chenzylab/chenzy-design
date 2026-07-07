<script lang="ts">
  import { Text, Paragraph } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: baseline; gap: 16px;">
    <Text size="small">小号文本</Text>
    <Text size="default">默认文本</Text>
    <Text size="large">大号文本</Text>
  </div>
  <Paragraph size="small">
    这是一段小号段落文本，常用于辅助说明或注释信息，字号较正文更小。
  </Paragraph>
  <div style="font-size: 20px;">
    外层 20px：<Text size="inherit">继承外层字号（inherit）</Text>，
    <Text size="small">而 small 固定 12px</Text>
  </div>
</div>
