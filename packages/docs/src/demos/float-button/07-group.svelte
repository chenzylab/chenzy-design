<script lang="ts">
  import { FloatButtonGroup, Text } from '@chenzy-design/svelte';
  import type { FloatButtonGroupItem } from '@chenzy-design/svelte';

  let last = $state('');

  const items: FloatButtonGroupItem[] = [
    { value: 'edit', content: '编辑' },
    { value: 'search', content: '搜索' },
    { value: 'help', content: '帮助' },
  ];
</script>

<Text type="tertiary">FloatButtonGroup 胶囊工具条：一个圆角条内 inline-flex 横排多项，点击委托直接读 e.target.dataset.value 回传（对齐 Semi）。</Text>
<div style="position:relative; height:120px">
  <FloatButtonGroup
    onClick={(value) => (last = value)}
    style="position:absolute; bottom:16px; right:16px"
    {items}
  />
</div>
<Text type="tertiary">最近点击：{last || '（无）'}</Text>
