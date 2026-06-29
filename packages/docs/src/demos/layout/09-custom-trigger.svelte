<script lang="ts">
  import { Layout, Button } from '@chenzy-design/svelte';

  let collapsed = $state(false);
  const cell =
    'display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);';
</script>

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout hasSider>
    <Layout.Sider
      width={200}
      collapsedWidth={72}
      {collapsed}
      onCollapse={(v) => (collapsed = v)}
      style="background: var(--cd-color-fill-1);"
    >
      <div style="padding:16px 12px; color: var(--cd-color-text-2);">
        {collapsed ? '面板' : '左侧面板内容'}
      </div>
      <!-- 自定义触发器 snippet：接收 { collapsed, toggle } -->
      {#snippet trigger({ collapsed: c, toggle })}
        <div style="padding:8px; border-top:1px solid var(--cd-color-border);">
          <Button size="small" block theme="borderless" onclick={toggle}>
            {c ? '展开 ›' : '‹ 收起面板'}
          </Button>
        </div>
      {/snippet}
    </Layout.Sider>
    <Layout.Content padding style="height: 200px; background: var(--cd-color-bg-0); color: var(--cd-color-text-2);">
      Sider 自身的 collapsible 折叠 + 自定义 trigger snippet（接收 collapsed/toggle），
      可用任意组件（这里用 Button）替代默认箭头。
    </Layout.Content>
  </Layout>
</div>
