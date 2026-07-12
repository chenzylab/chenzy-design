<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
</script>

<!--
  clickHeaderToExpand={false}：整个 Header 不再是热区，仅点击箭头才展开/收起，
  便于在 Header 内放置输入框等自定义交互元素。keepDOM 保留收起面板的 DOM。
-->
<Collapse clickHeaderToExpand={false} keepDOM>
  <Collapse.Panel header="点击右侧箭头展开（Header 本身不触发）" itemKey="1">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
</Collapse>
