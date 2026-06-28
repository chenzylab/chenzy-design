<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<style>
  .demo-header { background: #4f46e5; color: #fff; padding: 12px 24px; }
  .demo-sider { background: #312e81; color: #c7d2fe; padding: 16px 12px; min-width: 120px; }
  .demo-content { background: #f5f3ff; padding: 24px; flex: 1; }
  .demo-footer { background: #e0e7ff; padding: 10px 24px; font-size: 12px; color: #6366f1; }
</style>

<div style="min-height: 240px; display: flex; flex-direction: column;">
  <Layout>
    <Layout.Header class="demo-header">Header</Layout.Header>
    <Layout hasSider>
      <Layout.Sider class="demo-sider">Sider</Layout.Sider>
      <Layout.Content class="demo-content">Content</Layout.Content>
    </Layout>
    <Layout.Footer class="demo-footer">Footer</Layout.Footer>
  </Layout>
</div>
