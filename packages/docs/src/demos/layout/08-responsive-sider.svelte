<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  let collapsed = $state(false);
  let lastBreakpoint = $state('（缩放窗口或拖动分隔触发）');

  const cell =
    'display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);';
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout style="height: 100%;">
    <Layout.Header style="{cell} background: var(--cd-color-fill-0); font-weight:600; color: var(--cd-color-text-1);">
      响应式：窗口窄于 md（768px）时侧栏自动折叠
    </Layout.Header>
    <Layout hasSider>
      <Layout.Sider
        width={200}
        collapsedWidth={64}
        breakpoint="md"
        {collapsed}
        onCollapse={(v) => (collapsed = v)}
        onBreakpoint={(matched, bp) =>
          (lastBreakpoint = `命中 ${bp}：${matched ? '收起' : '展开'}`)}
        style="background: var(--cd-color-fill-1);"
      >
        <div style="padding:16px 12px; color: var(--cd-color-text-2);">
          {collapsed ? '☰' : '导航（窄屏自动收起）'}
        </div>
      </Layout.Sider>
      <Layout.Content padding style="background: var(--cd-color-bg-0); color: var(--cd-color-text-2);">
        breakpoint="md" + onBreakpoint 回调：视口跨越断点时自动折叠/展开并回调通知。
        <br />
        <span style="color: var(--cd-color-text-1);">最近断点事件：{lastBreakpoint}</span>
      </Layout.Content>
    </Layout>
  </Layout>
</div>
