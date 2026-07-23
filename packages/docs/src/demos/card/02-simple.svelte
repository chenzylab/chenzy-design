<script lang="ts">
  import { Card, Popover, Avatar } from '@chenzy-design/svelte';
  import { IconInfoCircle } from '@chenzy-design/icons';

  const { Meta } = Card;
</script>

<Card style="max-width: 360px;">
  Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统。
</Card>
<br />
<Card
  style="max-width: 360px;"
  bodyStyle="display: flex; align-items: center; justify-content: space-between;"
>
  <Meta title="Semi Doc">
    {#snippet avatar()}
      <Avatar
        alt="Card meta img"
        size="default"
        src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/card-meta-avatar-docs-demo.jpg"
      />
    {/snippet}
  </Meta>
  <Popover position="top" showArrow>
    {#snippet content()}
      <article style="padding: 6px;">这是一个 Card</article>
    {/snippet}
    <IconInfoCircle style="color: var(--cd-color-primary);" />
  </Popover>
</Card>
