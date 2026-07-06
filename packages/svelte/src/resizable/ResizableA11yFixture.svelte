<script lang="ts">
  import Resizable from './Resizable.svelte';

  interface Props {
    enable?: import('@chenzy-design/core').Enable | false;
  }
  let { enable = { right: true, bottom: true, bottomRight: true } }: Props = $props();
</script>

<Resizable {enable} defaultSize={{ width: 200, height: 160 }} minWidth={80} maxWidth={400}>
  <div style="padding:8px">panel</div>
</Resizable>
