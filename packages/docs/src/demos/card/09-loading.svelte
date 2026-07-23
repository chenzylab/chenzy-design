<script lang="ts">
  import { Card, Switch } from '@chenzy-design/svelte';

  const { Meta } = Card;

  let loading = $state(true);
</script>

<Switch onChange={(v) => (loading = !v)} />
<br />
<br />
<Card style="max-width: 360px;" {loading}>
  <Meta title="Semi Doc" description="全面、易用、优质" />
</Card>
