<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
  let childOpen = $state(false);
</script>

<div>
  <Button onclick={() => (open = !open)}>Toggle</Button>
  <Collapsible isOpen={open}>
    <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
      <span style="color: var(--cd-color-text-1);">Semi Design 的设计原则包括：</span>
      <Button onclick={() => (childOpen = !childOpen)}>Toggle List</Button>
    </div>
    <Collapsible isOpen={childOpen}>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: var(--cd-color-text-1);">
        <li><p>Semi Design 以内容优先进行设计。</p></li>
        <li><p>更容易地自定义主题。</p></li>
        <li><p>适用国际化场景。</p></li>
        <li><p>效率场景加入人性化关怀。</p></li>
      </ul>
    </Collapsible>
  </Collapsible>
</div>
