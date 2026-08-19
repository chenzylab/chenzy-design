<script lang="ts">
  import { Tabs, type PlainTab } from '@chenzy-design/svelte';

  // 同块3（card+tabList）结构，仅 type 换成 slash（对齐 Semi 两块同构示例）。
  const contentList = ['文档', '快速起步', '帮助'];
  const tabList: PlainTab[] = [
    { tab: '文档', itemKey: '1' },
    { tab: '快速起步', itemKey: '2' },
    { tab: '帮助', itemKey: '3' },
  ];

  let key = $state<string | number>('1');

  function onTabClick(newKey: string | number, type: 'key') {
    if (type === 'key') key = newKey;
  }
</script>

<Tabs type="slash" {tabList} onChange={(k) => onTabClick(k, 'key')}>
  {contentList[Number(key) - 1]}
</Tabs>
