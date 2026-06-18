<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  let theme = $state<'light' | 'dark'>('light');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

<main class="p-6">
  <header class="flex items-center justify-between mb-6">
    <h1 class="text-text-0 text-xl font-semibold">chenzy-design</h1>
    <Button
      type="tertiary"
      onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
    >
      切换主题：{theme}
    </Button>
  </header>

  <section class="flex gap-3 flex-wrap">
    <Button type="primary">主要按钮</Button>
    <Button type="secondary">次要按钮</Button>
    <Button type="tertiary">文字按钮</Button>
    <Button type="warning">警告</Button>
    <Button type="danger">危险</Button>
    <Button type="primary" disabled>禁用</Button>
    <Button type="primary" loading>加载中</Button>
    <Button type="primary" size="small">小</Button>
    <Button type="primary" size="large">大</Button>
  </section>
</main>
