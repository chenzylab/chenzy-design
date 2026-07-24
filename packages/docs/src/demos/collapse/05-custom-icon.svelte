<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
  import { IconPlus, IconMinus } from '@chenzy-design/icons';
</script>

<Collapse expandIcon={plus} collapseIcon={minus}>
  <Collapse.Panel header="This is panel header 1" itemKey="1">
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2">
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3">
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
</Collapse>

{#snippet plus()}
  <IconPlus />
{/snippet}
{#snippet minus()}
  <IconMinus />
{/snippet}
