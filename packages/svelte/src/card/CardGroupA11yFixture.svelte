<script lang="ts">
  import CardGroup from './CardGroup.svelte';
  import Card from './Card.svelte';

  interface Props {
    spacing?: number | number[];
    type?: 'grid';
    ariaLabel?: string;
  }
  let { spacing, type, ariaLabel }: Props = $props();
</script>

<CardGroup
  {...spacing !== undefined ? { spacing } : {}}
  {...type ? { type } : {}}
  {...ariaLabel ? { ariaLabel } : {}}
>
  <Card title="Card A">First</Card>
  <Card title="Card B">Second</Card>
</CardGroup>
