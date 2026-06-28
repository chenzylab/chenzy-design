<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<style>
  .demo-header { background: #4f46e5; color: #fff; padding: 0 24px; font-weight: 600; }
  .demo-sider { background: #312e81; color: #c7d2fe; padding: 16px 12px; }
  .demo-content { background: #f5f3ff; color: #4338ca; padding: 24px; }
  .demo-footer { background: #e0e7ff; font-size: 12px; color: #6366f1; }
</style>

<div style="min-height: 260px; display: flex; flex-direction: column;">
  <Layout>
    <Layout.Header class="demo-header">Header</Layout.Header>
    <Layout hasSider>
      <Layout.Sider class="demo-sider" width={180}>
        <div>导航项 一</div>
        <div>导航项 二</div>
        <div>导航项 三</div>
      </Layout.Sider>
      <Layout.Content class="demo-content" padding>
        含侧边栏的布局：Sider 固定宽度 180px，Content 占据剩余空间。
      </Layout.Content>
    </Layout>
    <Layout.Footer class="demo-footer">Footer</Layout.Footer>
  </Layout>
</div>
