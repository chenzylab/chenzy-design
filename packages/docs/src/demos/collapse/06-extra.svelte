<script lang="ts">
  import { Collapse, Tag } from '@chenzy-design/svelte';
  import { IconCopy } from '@chenzy-design/icons';
</script>

<Collapse>
  <Collapse.Panel header="This is panel header 1" itemKey="1" extra="1234">
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2" extra={copyIcon}>
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3" extra={recommended}>
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
</Collapse>

{#snippet copyIcon()}
  <IconCopy />
{/snippet}
{#snippet recommended()}
  <Tag color="violet" style="margin: 0;">Recommended</Tag>
{/snippet}
