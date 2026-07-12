<script lang="ts">
  import {
    Empty,
    Button,
    IllustrationNoContent,
    IllustrationNoContentDark,
  } from '@chenzy-design/svelte';
</script>

<Empty
  title="空状态标题"
  description="开始创建你的第一个仪表盘吧！"
  imageSlot={image}
  darkModeImageSlot={darkImage}
>
  <div>
    <Button style="padding: 6px 24px; margin-right: 12px;" type="primary">二级按钮</Button>
    <Button style="padding: 6px 24px;" theme="solid" type="primary">一级按钮</Button>
  </div>
</Empty>

{#snippet image()}
  <IllustrationNoContent style="width: 150px; height: 150px;" />
{/snippet}
{#snippet darkImage()}
  <IllustrationNoContentDark style="width: 150px; height: 150px;" />
{/snippet}
