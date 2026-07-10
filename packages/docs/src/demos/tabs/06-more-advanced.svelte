<script lang="ts">
  import { Tabs, TabPane, Button } from '@chenzy-design/svelte';

  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let active = $state<string | number>('Tab-0');
</script>

{#snippet moreTrigger()}
  <Button type="tertiary">点击展开更多</Button>
{/snippet}

<div style="width: 60%; min-width: 320px;">
  <!-- more 传对象：count 控制收入数量，render 自定义触发器，dropdownProps 透传下拉参数。 -->
  <Tabs
    type="card"
    value={active}
    onChange={(k) => (active = k)}
    more={{ count: 4, render: moreTrigger, dropdownProps: { position: 'bottomEnd' } }}
  >
    {#each keys as i (i)}
      <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
    {/each}
  </Tabs>
</div>
