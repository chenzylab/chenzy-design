<script lang="ts">
  import { Toast, Button, Typography } from '@chenzy-design/svelte';

  const { Text, Link } = Typography;

  // 配合 Typography 自定义链接文本，用来配合更复杂场景的使用（对齐 Semi）。
  // content 支持 Snippet（对齐 Semi ReactNode），传入自定义富文本内容。
</script>

{#snippet inlineContent()}
  <span>
    <Text>Hi, Bytedance dance dance</Text>
    <Link style="margin-left:12px">更多</Link>
  </span>
{/snippet}

{#snippet multiLineContent()}
  <span>
    <div>Hi, Bytedance dance dance</div>
    <div style="margin-top:8px">
      <Link>查看详情</Link>
      <Link style="margin-left:20px">一会再看</Link>
    </div>
  </span>
{/snippet}

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.info({ content: inlineContent, duration: 3 })}>Display Toast</Button>
  <Button onclick={() => Toast.info({ content: multiLineContent, duration: 3 })}>
    Display Multi-line Toast
  </Button>
</div>
