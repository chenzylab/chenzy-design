<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<style>
  .demo-shell { height: 300px; overflow: hidden; }
  .demo-header { background: #4f46e5; color: #fff; padding: 0 24px; font-weight: 600; }
  .demo-sider { background: #312e81; color: #c7d2fe; padding: 16px 12px; }
  .demo-scroll { overflow-y: auto; }
  .demo-content { background: #f5f3ff; color: #4338ca; padding: 24px; }
  .demo-block { height: 120px; margin-bottom: 16px; background: #ddd6fe; border-radius: 6px; }
  .demo-footer { background: #e0e7ff; font-size: 12px; color: #6366f1; }
</style>

<div class="demo-shell">
  <Layout hasSider>
    <Layout.Sider class="demo-sider" width={180}>
      <div>仪表盘</div>
      <div>用户</div>
      <div>报表</div>
      <div>设置</div>
    </Layout.Sider>
    <Layout>
      <Layout.Header class="demo-header" sticky>固定头部</Layout.Header>
      <Layout.Content class="demo-content demo-scroll" padding>
        典型后台布局：左侧固定导航栏，右侧头部 sticky，主区域可滚动。
        <div class="demo-block"></div>
        <div class="demo-block"></div>
        <div class="demo-block"></div>
      </Layout.Content>
      <Layout.Footer class="demo-footer">Footer · 2026</Layout.Footer>
    </Layout>
  </Layout>
</div>
