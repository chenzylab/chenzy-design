<script lang="ts">
  import { Card, Avatar, Popover } from '@chenzy-design/svelte';
  import { IconInfoCircle } from '@chenzy-design/icons';

  const { Meta } = Card;
</script>

<div>
  <Card
    shadows="hover"
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
  <br />
  <Card
    shadows="always"
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
</div>
