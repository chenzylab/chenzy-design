<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  // keepDOM（默认 true）：TabPane 写法下隐藏面板的 DOM 仍保留（display 由 hidden 控制），
  // 切换有动画。设 keepDOM={false} 则只渲染当前面板，切走即卸载、无动画。
  // lazyRender：仅当面板激活过才挂载进 DOM（首屏不预渲染未访问面板）。
  let active = $state<string | number>('1');
  let keep = $state(true);
  let lazy = $state(false);
</script>

<div style="display: flex; gap: 16px; margin-bottom: 12px; align-items: center;">
  <label style="display: inline-flex; gap: 6px; align-items: center;">
    <input type="checkbox" bind:checked={keep} /> keepDOM
  </label>
  <label style="display: inline-flex; gap: 6px; align-items: center;">
    <input type="checkbox" bind:checked={lazy} /> lazyRender
  </label>
</div>

<Tabs keepDOM={keep} lazyRender={lazy} activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1">文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
</Tabs>
