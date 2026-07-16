<script lang="ts">
  import { Tabs, type TabItem } from '@chenzy-design/svelte';

  // 数据驱动：传 tabList 数组定义标签，内容由 children 单节点按 activeKey 渲染
  // （对齐 Semi：使用 tabList 时每次只渲染当前激活项的内容）。
  const tabList: TabItem[] = [
    { tab: '文档', itemKey: '1' },
    { tab: '快速起步', itemKey: '2' },
    { tab: '帮助', itemKey: '3' },
  ];
  const contentMap: Record<string, string> = {
    '1': '文档内容',
    '2': '快速起步内容',
    '3': '帮助内容',
  };

  let active = $state<string | number>('1');
</script>

<Tabs type="card" {tabList} activeKey={active} onChange={(k) => (active = k)}>
  <div style="padding: 8px 0;">{contentMap[String(active)]}</div>
</Tabs>
