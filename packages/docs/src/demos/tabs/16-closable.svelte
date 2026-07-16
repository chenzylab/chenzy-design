<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  interface Item {
    tab: string;
    itemKey: string;
    text: string;
    closable?: boolean;
  }

  let tabList = $state<Item[]>([
    { tab: '文档', itemKey: '1', text: '文档', closable: true },
    { tab: '快速起步', itemKey: '2', text: '快速起步', closable: true },
    { tab: '帮助', itemKey: '3', text: '帮助' },
  ]);
  let active = $state<string | number>('1');

  function close(key: string | number) {
    tabList = tabList.filter((t) => t.itemKey !== key);
  }
</script>

<!-- 关闭：只有卡片样式支持关闭；单项 closable 控制是否可关。onTabClose 由父组件移除。 -->
<Tabs type="card" activeKey={active} onChange={(k) => (active = k)} onTabClose={close}>
  {#each tabList as t (t.itemKey)}
    <TabPane closable={t.closable} tab={t.tab} itemKey={t.itemKey}>{t.text}</TabPane>
  {/each}
</Tabs>
