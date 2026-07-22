<script lang="ts">
  import { Toast, Button, Space } from '@chenzy-design/svelte';

  // 补全场景：textMaxWidth 限制内容最大宽度、showClose 隐藏关闭按钮、icon 自定义图标
  //（对齐 Semi Options 表：textMaxWidth / showClose / icon）。
</script>

{#snippet rocket()}
  <span style="font-size:16px">🚀</span>
{/snippet}

<Space wrap>
  <Button
    onclick={() =>
      Toast.info({
        content:
          '这是一条很长的提示文本，通过 textMaxWidth 限制内容区最大宽度后会自动换行而不是无限拉宽卡片。',
        textMaxWidth: 240,
      })}>限制内容宽度</Button>
  <Button onclick={() => Toast.info({ content: '无关闭按钮的提示', showClose: false })}>
    隐藏关闭按钮
  </Button>
  <Button onclick={() => Toast.open({ content: '已发布到生产环境', icon: rocket })}>
    自定义图标
  </Button>
</Space>
