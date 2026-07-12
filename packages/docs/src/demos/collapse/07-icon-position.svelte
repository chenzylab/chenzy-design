<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
</script>

<!-- expandIconPosition="left"：箭头置于标题左侧（默认 right）。 -->
<Collapse expandIconPosition="left" defaultActiveKey="1">
  <Collapse.Panel header="This is panel header 1" itemKey="1">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
</Collapse>
