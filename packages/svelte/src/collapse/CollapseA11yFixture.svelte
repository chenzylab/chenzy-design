<!--
  仅供 Collapse.a11y.test.ts 使用的测试夹具：声明式 <Collapse.Panel>，
  DOM 对齐 Semi（header role=button + aria-owns 指向真实存在的 content region）。
-->
<script lang="ts">
  import { Collapse } from './index.js';

  interface Props {
    accordion?: boolean;
    defaultActiveKey?: string | string[];
  }
  let { accordion = false, defaultActiveKey = [] }: Props = $props();
</script>

<Collapse {accordion} {defaultActiveKey}>
  <Collapse.Panel header="Section A" itemKey="a">
    <p>Content for a</p>
  </Collapse.Panel>
  <Collapse.Panel header="Section B" itemKey="b">
    <p>Content for b</p>
  </Collapse.Panel>
  <Collapse.Panel header="Section C" itemKey="c" disabled>
    <p>Content for c</p>
  </Collapse.Panel>
</Collapse>
