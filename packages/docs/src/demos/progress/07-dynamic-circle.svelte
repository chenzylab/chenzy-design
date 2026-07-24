<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';

  let cirPerc = $state(40);
</script>

<div>
  <div>
    <Progress percent={cirPerc} type="circle" aria-label="disk usage" />
  </div>
  <Button theme="light" disabled={cirPerc === 0} onclick={() => (cirPerc -= 10)}>
    {#snippet icon()}<IconChevronLeft />{/snippet}
  </Button>
  <Button theme="light" disabled={cirPerc >= 100} onclick={() => (cirPerc += 10)}>
    {#snippet icon()}<IconChevronRight />{/snippet}
  </Button>
</div>
