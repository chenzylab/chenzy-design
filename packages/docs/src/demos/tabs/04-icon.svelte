<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';
  import { IconFile, IconGlobe, IconHelpCircle } from '@chenzy-design/icons';

  let active = $state<string | number>('1');
</script>

{#snippet iconFile()}<IconFile />{/snippet}
{#snippet iconGlobe()}<IconGlobe />{/snippet}
{#snippet iconHelp()}<IconHelpCircle />{/snippet}

<Tabs activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1" icon={iconFile}>文档</TabPane>
  <TabPane tab="快速起步" itemKey="2" icon={iconGlobe}>快速起步</TabPane>
  <TabPane tab="帮助" itemKey="3" icon={iconHelp}>帮助</TabPane>
</Tabs>
