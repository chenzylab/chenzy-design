<script lang="ts">
  import { createRawSnippet } from 'svelte';
  import { Toast, Button } from '@chenzy-design/svelte';

  // 自定义图标：用 createRawSnippet 在命令式调用里传入 icon snippet。
  const rocket = createRawSnippet(() => ({
    render: () => `<span style="font-size:16px">🚀</span>`,
  }));
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.open({ content: '已发布到生产环境', icon: rocket })}>
    自定义图标
  </Button>
  <Button onclick={() => Toast.info('隐藏图标的纯文本提示', { icon: false })}>隐藏图标</Button>
  <Button onclick={() => Toast.success('深色卡片主题', { theme: 'dark', position: 'topRight' })}>
    深色主题
  </Button>
  <Button
    onclick={() =>
      Toast.info(
        '这是一条很长的提示文本，通过 textMaxWidth 限制内容区最大宽度后会自动换行而不是无限拉宽卡片。',
        { textMaxWidth: 240 },
      )}>限制内容宽度</Button>
</div>
