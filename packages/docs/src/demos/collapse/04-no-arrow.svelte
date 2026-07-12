<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
</script>

<Collapse accordion>
  <Collapse.Panel header="This is panel header 1" itemKey="1" showArrow={false}>
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
</Collapse>
