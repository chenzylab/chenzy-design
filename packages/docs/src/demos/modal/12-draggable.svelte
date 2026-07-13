<script lang="ts">
  import { Modal, Button, DragMove } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>Open Modal</Button>
<Modal title="可拖拽 Modal" {visible} onCancel={() => (visible = false)}>
  {#snippet modalRender(modal)}
    <DragMove>
      {@render modal()}
    </DragMove>
  {/snippet}
  <p>This is the content of a draggable modal.</p>
  <p>Here is more content...</p>
</Modal>
