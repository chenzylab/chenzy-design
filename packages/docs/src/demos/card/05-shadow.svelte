<script lang="ts">
  import { Card, Avatar } from '@chenzy-design/svelte';
</script>

<!-- shadows 设置阴影时机：hover（悬停显示）、always（始终显示） -->
<Card
  shadows="hover"
  style="max-width: 360px;"
  bodyStyle="display: flex; align-items: center; justify-content: space-between;"
>
  <Card.Meta title="Semi Doc — hover">
    {#snippet avatar()}
      <Avatar size="default" color="blue">SD</Avatar>
    {/snippet}
  </Card.Meta>
</Card>

<br />

<Card
  shadows="always"
  style="max-width: 360px;"
  bodyStyle="display: flex; align-items: center; justify-content: space-between;"
>
  <Card.Meta title="Semi Doc — always">
    {#snippet avatar()}
      <Avatar size="default" color="green">SD</Avatar>
    {/snippet}
  </Card.Meta>
</Card>
