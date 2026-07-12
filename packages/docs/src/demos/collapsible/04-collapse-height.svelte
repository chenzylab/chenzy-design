<script lang="ts">
  import { Collapsible, Button } from '@chenzy-design/svelte';

  let open = $state(false);
  // 折叠态叠加底部渐隐遮罩（对齐 Semi 自定义折叠高度示例）。
  const maskStyle = $derived(
    open
      ? ''
      : '-webkit-mask-image: linear-gradient(to bottom, black 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.2) 80%, transparent 100%);',
  );
</script>

<div>
  <Button onclick={() => (open = !open)}>Toggle</Button>
  <div style="position: relative;">
    <Collapsible isOpen={open} collapseHeight={60} style={maskStyle}>
      <ul style="margin: 0; padding-left: 20px; color: var(--cd-color-text-1);">
        <li><p>Semi Design 以内容优先进行设计。</p></li>
        <li><p>更容易地自定义主题。</p></li>
        <li><p>适用国际化场景。</p></li>
        <li><p>效率场景加入人性化关怀。</p></li>
      </ul>
    </Collapsible>
    {#if !open}
      <a
        href={null}
        onclick={() => (open = true)}
        style="position: absolute; left: 0; right: 0; bottom: -10px; text-align: center; font-weight: 700; cursor: pointer; color: var(--cd-color-text-1);"
      >
        + Show More
      </a>
    {/if}
  </div>
</div>
