<script lang="ts">
  import { SideSheet, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  let containerEl = $state<HTMLElement | null>(null);
  const getContainer = () => containerEl;
</script>

<div
  bind:this={containerEl}
  class="sidesheet-container"
  style="height:320px; overflow:hidden; position:relative; border:1px solid var(--cd-color-border); border-radius:2px; padding:24px; text-align:center; background:var(--cd-color-fill-0)"
>
  <span>Render in this</span>
  <br />
  <br />
  <Button onclick={() => (visible = true)}>Open SideSheet</Button>
  <SideSheet
    title="渲染在指定容器内部"
    {visible}
    onCancel={() => (visible = false)}
    width={220}
    getPopupContainer={getContainer}
  >
    <p>This is the content of a basic sidesheet.</p>
    <p>Here is more content...</p>
  </SideSheet>
</div>
