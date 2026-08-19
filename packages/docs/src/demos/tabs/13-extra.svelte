<script lang="ts">
  import { Tabs, TabPane, Button } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
  // Semi 原 demo 用 alert('you have clicked me!') 反馈点击；alert 会阻塞标签页且无法真机验证，
  // 改用就地文字反馈，效果等价（见 demo-no-alert-blocks-automation）。
  let clickedCount = $state(0);
</script>

{#snippet extra()}
  <Button onclick={() => (clickedCount += 1)}>Extra Action</Button>
{/snippet}

<!-- tabBarExtraContent：在标签栏右侧添加附加操作。 -->
<Tabs activeKey={active} onChange={(k) => (active = k)} tabBarExtraContent={extra}>
  <TabPane tab="文档" itemKey="1">文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
</Tabs>
{#if clickedCount > 0}
  <p data-testid="extra-clicked-feedback" style="margin-top: 8px; color: var(--cd-color-text-2); font-size: 12px;">
    you have clicked me! （已点击 {clickedCount} 次）
  </p>
{/if}
