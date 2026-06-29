<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  let collapsed = $state(false);
  const cell =
    'display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);';
</script>

<div style="border:1px solid var(--cd-color-border); border-radius:8px; overflow:hidden;">
  <Layout hasSider>
    <Layout.Content padding style="height:200px; background: var(--cd-color-bg-0); color: var(--cd-color-text-2);">
      右置可折叠侧栏：placement="right" + collapsible + reverseArrow，
      箭头方向随右侧位置反转。常用于详情页的辅助信息面板。
    </Layout.Content>
    <Layout.Sider
      placement="right"
      collapsible
      reverseArrow
      width={200}
      collapsedWidth={48}
      {collapsed}
      onCollapse={(v) => (collapsed = v)}
      style="background: var(--cd-color-fill-1);"
    >
      <div style="padding:16px 12px; color: var(--cd-color-text-2);">
        {collapsed ? '属性' : '属性面板'}
      </div>
    </Layout.Sider>
  </Layout>
</div>
