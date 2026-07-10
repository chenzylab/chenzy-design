<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

{#snippet iconFile()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M4 1h6l3 3v11H3V2a1 1 0 0 1 1-1Zm5 1v3h3L9 2Z" />
  </svg>
{/snippet}
{#snippet iconGlobe()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm4.9 6h-2a10 10 0 0 0-.7-3A5.5 5.5 0 0 1 12.9 7ZM8 2.6c.5.7 1 1.9 1.2 3.4H6.8C7 4.5 7.5 3.3 8 2.6ZM3.1 9h2c.1 1.1.3 2.1.7 3A5.5 5.5 0 0 1 3.1 9Zm2-2h-2a5.5 5.5 0 0 1 2.7-3 10 10 0 0 0-.7 3ZM8 13.4c-.5-.7-1-1.9-1.2-3.4h2.4c-.2 1.5-.7 2.7-1.2 3.4Zm2.2-1.4c.4-.9.6-1.9.7-3h2a5.5 5.5 0 0 1-2.7 3Z" />
  </svg>
{/snippet}
{#snippet iconHelp()}
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 11.5a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm1.3-4.2c-.5.4-.6.6-.6 1v.3H7.3v-.4c0-.8.3-1.3.9-1.7.5-.4.7-.6.7-1 0-.5-.4-.8-1-.8s-1 .4-1 1H5.5c0-1.3 1-2.2 2.4-2.2s2.3.8 2.3 2c0 .8-.4 1.3-.9 1.5Z" />
  </svg>
{/snippet}

<Tabs value={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1" icon={iconFile}>文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2" icon={iconGlobe}>快速起步内容</TabPane>
  <TabPane tab="帮助" itemKey="3" icon={iconHelp}>帮助内容</TabPane>
</Tabs>
