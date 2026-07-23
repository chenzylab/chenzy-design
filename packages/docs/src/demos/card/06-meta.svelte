<script lang="ts">
  import { Card, Avatar, Space, Button, Typography } from '@chenzy-design/svelte';

  const { Meta } = Card;
  const { Text } = Typography;
</script>

<Card
  style="max-width: 340px;"
  footerLine={true}
  footerStyle="display: flex; justify-content: flex-end;"
>
  {#snippet title()}
    <Meta title="Semi Doc" description="全面、易用、优质">
      {#snippet avatar()}
        <Avatar
          alt="Card meta img"
          size="default"
          src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/card-meta-avatar-docs-demo.jpg"
        />
      {/snippet}
    </Meta>
  {/snippet}
  {#snippet headerExtraContent()}
    <Text link>More</Text>
  {/snippet}
  {#snippet cover()}
    <img
      alt="example"
      src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/card-cover-docs-demo.jpeg"
    />
  {/snippet}
  {#snippet footer()}
    <Space>
      <Button theme="borderless" type="primary">精选案例</Button>
      <Button theme="solid" type="primary">开始使用</Button>
    </Space>
  {/snippet}
  Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统。
</Card>
