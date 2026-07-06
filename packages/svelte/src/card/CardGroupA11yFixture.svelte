<script lang="ts">
  import CardGroup from './CardGroup.svelte';
  import Card from './Card.svelte';

  interface Props {
    spacing?: number | number[];
    ariaLabel?: string;
  }
  let { spacing, ariaLabel }: Props = $props();
</script>

<CardGroup {...spacing !== undefined ? { spacing } : {}} {...ariaLabel ? { ariaLabel } : {}}>
  <Card title="Card A">First</Card>
  <Card title="Card B">Second</Card>
</CardGroup>
