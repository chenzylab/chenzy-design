<script lang="ts">
  import { Card, Avatar, Popover } from '@chenzy-design/svelte';
</script>

<!-- 简洁卡片：只设置内容区域，或配合 Card.Meta + bodyStyle 排布头像与操作 -->
<Card style="max-width: 360px;">
  chenzy-design 是一套对齐 Semi Design 的组件系统。
</Card>

<br />

<Card
  style="max-width: 360px;"
  bodyStyle="display: flex; align-items: center; justify-content: space-between;"
>
  <Card.Meta title="Semi Doc">
    {#snippet avatar()}
      <Avatar size="default" alt="Card meta img" color="blue">SD</Avatar>
    {/snippet}
  </Card.Meta>
  <Popover position="top" showArrow>
    {#snippet content()}
      <div style="padding: 6px;">这是一个 Card</div>
    {/snippet}
    <span style="color: var(--cd-color-primary); cursor: help;">ⓘ</span>
  </Popover>
</Card>
