<script lang="ts">
  import { Card, Avatar, Button, Space, Typography } from '@chenzy-design/svelte';
</script>

<!-- 用 Card.Meta 承载 title / avatar / description，配合 footer 放置底部操作 -->
<Card style="max-width: 340px;" footerLine={true} footerStyle="display: flex; justify-content: flex-end;">
  {#snippet title()}
    <Card.Meta title="Semi Doc" description="全面、易用、优质">
      {#snippet avatar()}
        <Avatar size="default" color="light-blue">SD</Avatar>
      {/snippet}
    </Card.Meta>
  {/snippet}
  {#snippet headerExtraContent()}
    <Typography.Link href="#">More</Typography.Link>
  {/snippet}
  {#snippet cover()}
    <div
      style="height: 150px; background: linear-gradient(135deg, var(--cd-color-cyan-4) 0%, var(--cd-color-primary) 100%);"
    ></div>
  {/snippet}
  {#snippet footer()}
    <Space spacing={8}>
      <Button theme="borderless" type="primary">精选案例</Button>
      <Button theme="solid" type="primary">开始使用</Button>
    </Space>
  {/snippet}
  chenzy-design 是一套对齐 Semi Design 的组件系统。
</Card>
