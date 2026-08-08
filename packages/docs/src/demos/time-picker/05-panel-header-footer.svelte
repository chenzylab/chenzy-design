<script lang="ts">
  import { TimePicker, Button } from '@chenzy-design/svelte';

  let open = $state(false);

  const closePanel = () => (open = false);

  function onOpenChange(next: boolean) {
    open = next;
    console.log(next);
  }
</script>

<div>
  <TimePicker {open} {onOpenChange} panelHeader="Time Select" panelFooter={footer} />
  {#snippet footer()}
    <Button onclick={closePanel}>close</Button>
  {/snippet}
  <br /><br />
  <TimePicker
    type="timeRange"
    panelHeader={['start header', 'end header']}
    panelFooter={[startFooter, endFooter]}
  />
  {#snippet startFooter()}
    <Button onclick={() => console.log('start footer')}>start footer</Button>
  {/snippet}
  {#snippet endFooter()}
    <Button onclick={() => console.log('end footer')}>end footer</Button>
  {/snippet}
</div>
