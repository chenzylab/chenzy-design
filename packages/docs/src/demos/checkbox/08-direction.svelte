<script lang="ts">
  import { CheckboxGroup, Text } from '@chenzy-design/svelte';

  const options = [
    { label: '抖音', value: 'douyin' },
    { label: '今日头条', value: 'toutiao' },
    { label: '西瓜视频', value: 'xigua' },
  ];
</script>

<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <!-- direction 控制组内布局：vertical（默认）/ horizontal -->
  <div>
    <Text type="tertiary">vertical（默认）</Text>
    <CheckboxGroup direction="vertical" defaultValue={['douyin']} {options} />
  </div>
  <div>
    <Text type="tertiary">horizontal</Text>
    <CheckboxGroup direction="horizontal" defaultValue={['douyin']} {options} />
  </div>
</div>
