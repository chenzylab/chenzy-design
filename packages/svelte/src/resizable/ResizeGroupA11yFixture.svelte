<script lang="ts">
  import ResizeGroup from './ResizeGroup.svelte';
  import ResizeItem from './ResizeItem.svelte';
  import ResizeHandler from './ResizeHandler.svelte';

  interface Props {
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
  }
  let { direction = 'horizontal', disabled = false }: Props = $props();
</script>

<ResizeGroup {direction} style="width:400px;height:200px">
  <ResizeItem defaultSize="40%" min="80px">A</ResizeItem>
  <ResizeHandler {disabled} />
  <ResizeItem>B</ResizeItem>
</ResizeGroup>
