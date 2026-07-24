<script lang="ts">
  import { Tabs, TabPane, RadioGroup, Radio } from '@chenzy-design/svelte';
  import { IconFile, IconGlobe, IconHelpCircle } from '@chenzy-design/icons';

  let type = $state<'line' | 'card' | 'button'>('line');
  let active = $state<string | number>('1');
</script>

{#snippet iconFile()}<IconFile />{/snippet}
{#snippet iconGlobe()}<IconGlobe />{/snippet}
{#snippet iconHelp()}<IconHelpCircle />{/snippet}

<RadioGroup
  value={type}
  onChange={(e) => (type = e.target.value as 'line' | 'card' | 'button')}
  type="button"
  style="display:flex; width:200px; justify-content:center; margin-bottom:16px"
>
  <Radio value="line">Line</Radio>
  <Radio value="card">Card</Radio>
  <Radio value="button">Button</Radio>
</RadioGroup>

<!-- tabPosition=left：竖向标签栏，支持 line / card / button 三型（对齐 Semi）。 -->
<Tabs {type} tabPosition="left" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1" icon={iconFile}>文档</TabPane>
  <TabPane tab="快速起步" itemKey="2" icon={iconGlobe}>快速起步</TabPane>
  <TabPane tab="帮助" itemKey="3" icon={iconHelp}>帮助</TabPane>
</Tabs>
