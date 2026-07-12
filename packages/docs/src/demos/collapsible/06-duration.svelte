<script lang="ts">
  import { Collapsible, Button, InputNumber } from '@chenzy-design/svelte';

  let open = $state(false);
  let duration = $state(250);
</script>

<div>
  <span style="color: var(--cd-color-text-1);">设置动画时间：</span>
  <InputNumber
    min={0}
    value={duration}
    step={10}
    style="width: 120px;"
    onChange={(val) => (duration = Number(val) || 0)}
  />
  <br />
  <Button style="margin-top: 8px;" onclick={() => (open = !open)}>Toggle</Button>
  <Collapsible isOpen={open} {duration}>
    <ul style="margin: 8px 0 0; padding-left: 20px; color: var(--cd-color-text-1);">
      <li><p>Semi Design 以内容优先进行设计。</p></li>
      <li><p>更容易地自定义主题。</p></li>
      <li><p>适用国际化场景。</p></li>
      <li><p>效率场景加入人性化关怀。</p></li>
    </ul>
  </Collapsible>
</div>
