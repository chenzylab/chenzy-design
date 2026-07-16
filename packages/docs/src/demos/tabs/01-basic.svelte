<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

<Tabs type="line" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1">
    <p style="line-height: 1.8; margin: 12px 0;">
      chenzy-design 是一套对齐 Semi Design 的 Svelte 组件库，帮助开发者更容易地打造高质量、
      体验一致、符合设计规范的 Web 应用。
    </p>
  </TabPane>
  <TabPane tab="快速起步" itemKey="2">
    <pre style="margin: 16px 0; padding: 16px; border-radius: 6px; background: var(--cd-color-fill-0); color: var(--cd-color-text-1);"><code>pnpm add @chenzy-design/svelte</code></pre>
  </TabPane>
  <TabPane tab="帮助" itemKey="3">
    <p style="line-height: 1.8; margin: 12px 0;">遇到问题？欢迎在仓库提 issue 反馈。</p>
  </TabPane>
</Tabs>
