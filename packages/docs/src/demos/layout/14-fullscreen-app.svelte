<script lang="ts">
  import { Layout, Avatar } from '@chenzy-design/svelte';

  const cell =
    'display:flex; align-items:center; color: var(--cd-color-text-2);';
  const navRows = ['仪表盘', '订单', '商品', '用户', '报表', '设置', '日志', '权限'];
  const contentRows = Array.from({ length: 10 }, (_, i) => i + 1);
</script>

<!-- 全屏应用骨架：固定头/侧/底，仅中间内容区滚动（demo 内用固定高度容器模拟视口）。 -->
<div style="border:1px solid var(--cd-color-border); border-radius:8px; overflow:hidden; height:320px;">
  <Layout hasSider style="height:100%;">
    <Layout.Sider width={180} style="background: var(--cd-color-fill-1); overflow-y:auto;">
      <div style="padding:12px;">
        {#each navRows as n (n)}
          <div style="padding:8px 10px; border-radius:4px; color: var(--cd-color-text-2);">{n}</div>
        {/each}
      </div>
    </Layout.Sider>
    <Layout style="height:100%;">
      <Layout.Header
        sticky
        style="{cell} justify-content:space-between; padding-inline:16px; background: var(--cd-color-bg-1);"
      >
        <span style="font-weight:600; color: var(--cd-color-text-1);">应用控制台</span>
        <Avatar size="small" style="background-color:var(--cd-color-primary);color:#fff">AB</Avatar>
      </Layout.Header>
      <Layout.Content padding style="overflow-y:auto; background: var(--cd-color-bg-0);">
        {#each contentRows as r (r)}
          <div
            style="height:56px; margin-bottom:12px; border-radius:6px; border:1px solid var(--cd-color-border); display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);"
          >
            数据卡片 {r}
          </div>
        {/each}
      </Layout.Content>
      <Layout.Footer style="{cell} justify-content:center; background: var(--cd-color-bg-1);">
        © 2026 chenzy-design
      </Layout.Footer>
    </Layout>
  </Layout>
</div>
