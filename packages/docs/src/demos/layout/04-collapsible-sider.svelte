<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  let collapsed = $state(false);
</script>

<style>
  .demo-header { background: #4f46e5; color: #fff; padding: 0 24px; font-weight: 600; }
  .demo-sider { background: #312e81; color: #c7d2fe; }
  .demo-sider-body { padding: 16px 12px; }
  .demo-content { background: #f5f3ff; color: #4338ca; padding: 24px; }
</style>

<div style="min-height: 280px; display: flex; flex-direction: column;">
  <Layout>
    <Layout.Header class="demo-header">
      侧栏当前{collapsed ? '已折叠' : '已展开'}
    </Layout.Header>
    <Layout hasSider>
      <Layout.Sider
        class="demo-sider"
        collapsible
        width={200}
        collapsedWidth={60}
        {collapsed}
        onCollapse={(value) => (collapsed = value)}
      >
        <div class="demo-sider-body">
          {#if collapsed}
            <div>一</div>
            <div>二</div>
            <div>三</div>
          {:else}
            <div>仪表盘</div>
            <div>订单管理</div>
            <div>系统设置</div>
          {/if}
        </div>
      </Layout.Sider>
      <Layout.Content class="demo-content" padding>
        点击侧栏底部箭头按钮可折叠 / 展开。collapsible 启用内置触发器，collapsed 双向绑定驱动内容切换。
      </Layout.Content>
    </Layout>
  </Layout>
</div>
