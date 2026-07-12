<script lang="ts">
  import {
    Empty,
    Button,
    IllustrationSuccess,
    IllustrationSuccessDark,
  } from '@chenzy-design/svelte';
</script>

<!-- horizontal：插画在左、文案在右，适合长描述 -->
<Empty
  title="创建成功"
  layout="horizontal"
  description="这是一段很长的描述文本，当文本过长的时候推荐使用这种布局形式。这是一段很长的描述文本，当文本过长的时候推荐使用这种布局形式。这是一段很长的描述文本，当文本过长的时候推荐使用这种布局形式。"
  style="width: 800px; margin: 0 auto;"
  imageSlot={image}
  darkModeImageSlot={darkImage}
>
  <Button type="primary" theme="solid" style="padding: 6px 24px;">开始操作</Button>
</Empty>

{#snippet image()}
  <IllustrationSuccess style="width: 150px; height: 150px;" />
{/snippet}
{#snippet darkImage()}
  <IllustrationSuccessDark style="width: 150px; height: 150px;" />
{/snippet}
