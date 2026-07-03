<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let declActive = $state<string | number>('doc');
  let dataActive = $state<string | number>('home');
</script>

{#snippet iconDoc()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M4 1h6l3 3v11H3V2a1 1 0 0 1 1-1Zm5 1v3h3L9 2Z" />
  </svg>
{/snippet}
{#snippet iconStar()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="m8 1 2 4.2 4.6.6-3.4 3.2.9 4.6L8 11.4 3.9 13.6l.9-4.6L1.4 5.8 6 5.2 8 1Z" />
  </svg>
{/snippet}
{#snippet iconHome()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M8 1 1 7h2v7h4v-4h2v4h4V7h2L8 1Z" />
  </svg>
{/snippet}
{#snippet iconSettings()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M8 5.5A2.5 2.5 0 1 0 8 10.5 2.5 2.5 0 0 0 8 5.5Zm6-.5-1.3-.3a5 5 0 0 0-.4-1l.7-1.1-1.4-1.4-1.1.7a5 5 0 0 0-1-.4L9 0H7l-.3 1.3a5 5 0 0 0-1 .4L4.6 1 3.2 2.4l.7 1.1a5 5 0 0 0-.4 1L2 5v2l1.3.3a5 5 0 0 0 .4 1L3 9.4l1.4 1.4 1.1-.7a5 5 0 0 0 1 .4L7 12h2l.3-1.3a5 5 0 0 0 1-.4l1.1.7 1.4-1.4-.7-1.1a5 5 0 0 0 .4-1L14 7V5Z" />
  </svg>
{/snippet}

<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">声明式：每个 &lt;Tabs.Pane&gt; 传 icon Snippet</p>
    <Tabs value={declActive} onChange={(k) => (declActive = k)}>
      <TabPane tab="文档" itemKey="doc" icon={iconDoc}>文档内容</TabPane>
      <TabPane tab="收藏" itemKey="star" icon={iconStar}>收藏内容</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">数据驱动：tabList 的 TabItem.icon（card 类型）</p>
    <Tabs
      type="card"
      value={dataActive}
      onChange={(k) => (dataActive = k)}
      tabList={[
        { tab: '首页', itemKey: 'home', icon: iconHome },
        { tab: '设置', itemKey: 'settings', icon: iconSettings },
      ]}
    >
      <TabPane itemKey="home">首页内容</TabPane>
      <TabPane itemKey="settings">设置内容</TabPane>
    </Tabs>
  </div>
</div>
