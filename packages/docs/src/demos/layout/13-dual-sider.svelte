<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  const cell =
    'display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);';
</script>

<div style="border:1px solid var(--cd-color-border); border-radius:8px; overflow:hidden;">
  <Layout>
    <Layout.Header style="{cell} background: var(--cd-color-fill-0); font-weight:600; color: var(--cd-color-text-1);">
      Header
    </Layout.Header>
    <Layout hasSider>
      <Layout.Sider width={160} style="{cell} background: var(--cd-color-fill-1);">左：导航</Layout.Sider>
      <Layout.Content style="{cell} height:200px; background: var(--cd-color-bg-0);">中：主内容</Layout.Content>
      <Layout.Sider placement="right" width={160} style="{cell} background: var(--cd-color-fill-1);">右：辅助面板</Layout.Sider>
    </Layout>
    <Layout.Footer style="{cell} background: var(--cd-color-fill-0);">Footer</Layout.Footer>
  </Layout>
</div>
