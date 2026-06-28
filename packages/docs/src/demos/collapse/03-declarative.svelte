<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
</script>

<Collapse>
  <Collapse.Panel itemKey="a" header="声明式面板 A">
    <p>使用 Collapse.Panel 子组件可以直接写 JSX 内容，灵活度更高。</p>
  </Collapse.Panel>
  <Collapse.Panel itemKey="b" header="声明式面板 B">
    <p>每个 Panel 独立管理自己的 header 与内容。</p>
  </Collapse.Panel>
  <Collapse.Panel itemKey="c" header="禁用面板" disabled>
    <p>该面板已禁用，无法展开或收起。</p>
  </Collapse.Panel>
</Collapse>
