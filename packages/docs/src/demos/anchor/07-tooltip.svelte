<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  // 很长的标题 + 窄容器（maxWidth）触发文字缩略；hover 缩略链接显示完整 title。
  const links = [
    { key: '#tip-a', href: '#tip-a', title: '这是一个非常非常长的锚点标题会被省略号截断' },
    { key: '#tip-b', href: '#tip-b', title: '另一个同样很长需要 Tooltip 才能看全的标题' },
    { key: '#tip-c', href: '#tip-c', title: '短标题' },
  ];
</script>

<Text type="tertiary">链接文字缩略时 hover 显示完整标题（showTooltip；position=right）。</Text>
<div style="width: 160px; margin-block-start: 8px">
  <Anchor {links} showTooltip position="right" maxWidth={140} />
</div>
