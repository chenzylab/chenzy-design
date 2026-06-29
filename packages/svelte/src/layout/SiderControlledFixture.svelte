<!-- 测试夹具：受控 Sider（collapsed + onCollapse 回写），验证 toggle 往返。 -->
<script lang="ts">
  import Layout from './Layout.svelte';
  import Sider from './Sider.svelte';

  let collapsed = $state(false);
</script>

<Layout hasSider>
  <Sider collapsible {collapsed} onCollapse={(v) => (collapsed = v)} width={200} collapsedWidth={64}>
    <div>面板</div>
  </Sider>
</Layout>
