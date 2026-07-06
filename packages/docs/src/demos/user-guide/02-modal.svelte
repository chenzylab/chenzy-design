<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

{#snippet coverA()}
  <div
    style="height:120px; display:flex; align-items:center; justify-content:center; background:var(--cd-color-fill-0); font-size:40px"
  >
    🎉
  </div>
{/snippet}

<Button onclick={() => (visible = true)}>查看新特性</Button>

<UserGuide
  mode="modal"
  {visible}
  steps={[
    {
      title: '欢迎使用新版工作台',
      description: '我们重新设计了首页布局，让常用功能触手可及。',
      cover: coverA,
    },
    {
      title: '开始探索',
      description: '所有历史数据都已迁移，随时可以继续之前的工作。',
    },
  ]}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
