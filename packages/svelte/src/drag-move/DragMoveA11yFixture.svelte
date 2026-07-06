<script lang="ts">
  import DragMove from './DragMove.svelte';

  interface Props {
    keyboard?: boolean;
  }
  let { keyboard = false }: Props = $props();
</script>

<div style="position:relative;height:300px;width:300px">
  <DragMove {keyboard} constrainer="parent">
    <div style="width:80px;height:60px;padding:8px">card</div>
  </DragMove>
</div>
