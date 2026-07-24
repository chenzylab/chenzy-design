<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';

  let percent = $state(40);
</script>

<div>
  <Progress {percent} showInfo aria-label="disk usage" />
  <Button theme="light" disabled={percent === 0} onclick={() => (percent -= 10)}>
    {#snippet icon()}<IconChevronLeft />{/snippet}
  </Button>
  <Button theme="light" disabled={percent >= 100} onclick={() => (percent += 10)}>
    {#snippet icon()}<IconChevronRight />{/snippet}
  </Button>
</div>
