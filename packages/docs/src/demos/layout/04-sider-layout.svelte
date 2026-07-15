<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  const commonStyle =
    'height: 64px; line-height: 64px; text-align: center; background: var(--cd-color-fill-0);';
</script>

<Layout>
  <Layout.Sider style="width: 120px; background: var(--cd-color-fill-2);">Sider</Layout.Sider>
  <Layout>
    <Layout.Header style={commonStyle}>Header</Layout.Header>
    <Layout.Content style="height: 300px; line-height: 300px; text-align: center;">
      Content
    </Layout.Content>
    <Layout.Footer style={commonStyle}>Footer</Layout.Footer>
  </Layout>
</Layout>
