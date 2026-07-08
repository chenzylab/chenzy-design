<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<div style="width: 360px">
  <TagInput
    defaultValue={['svelte', 'vite', 'unocss']}
    separator={[',', 'Enter']}
    placeholder="输入后回车添加"
  >
    {#snippet removeIcon()}
      <span class="custom-remove" aria-hidden="true">✕</span>
    {/snippet}
  </TagInput>
</div>

<style>
  .custom-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 14px;
    block-size: 14px;
    border-radius: 50%;
    font-size: 10px;
    line-height: 1;
    color: var(--cd-color-text-2);
    transition: all 0.15s ease;
  }
  .custom-remove:hover {
    background: var(--cd-color-danger, #f5222d);
    color: #fff;
  }
</style>
