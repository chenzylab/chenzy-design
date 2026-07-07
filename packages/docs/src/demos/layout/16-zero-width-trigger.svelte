<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  let collapsed = $state(false);
</script>

<!-- collapsedWidth={0}：侧栏完全收起为 0 宽。此时内建零宽浮动触发块（collapsible）
     逸出侧栏外缘，收起后仍可点击展开——否则 0 宽侧栏将无处可点、无法恢复。 -->
<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout hasSider style="height: 100%;">
    <Layout.Sider
      collapsible
      width={200}
      collapsedWidth={0}
      {collapsed}
      onCollapse={(v) => (collapsed = v)}
      style="background: var(--cd-color-fill-1);"
    >
      <div style="padding:16px 12px; color: var(--cd-color-text-2);">导航面板（可完全收起）</div>
    </Layout.Sider>
    <Layout.Content
      padding
      style="display:flex; align-items:center; justify-content:center; text-align:center; background: var(--cd-color-bg-0); color: var(--cd-color-text-2);"
    >
      {collapsed
        ? '侧栏已完全收起（0 宽）。点击左缘浮动的 › 块可重新展开。'
        : '点击侧栏底部的 ‹ 收起——它会收成 0 宽，仅在左缘留一个浮动触发块。'}
    </Layout.Content>
  </Layout>
</div>
