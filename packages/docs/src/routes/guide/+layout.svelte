<script lang="ts">
  import type { Snippet } from 'svelte';

  const { children }: { children: Snippet } = $props();
</script>

<div class="guide-content" data-pagefind-body>
  {@render children()}
</div>

<style>
  .guide-content :global(h1) {
    font-size: 28px;
    margin: 0 0 16px;
    line-height: 1.3;
  }
  .guide-content :global(h2) {
    font-size: 18px;
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    line-height: 1.4;
  }
  .guide-content :global(h3) {
    font-size: 15px;
    margin: 20px 0 8px;
  }
  .guide-content :global(p) {
    line-height: 1.7;
    color: var(--cd-color-text-0, #1f2329);
    margin: 0 0 12px;
  }
  .guide-content :global(a) {
    color: var(--cd-color-primary, #165dff);
    text-decoration: none;
  }
  .guide-content :global(a:hover) {
    text-decoration: underline;
  }
  .guide-content :global(ul),
  .guide-content :global(ol) {
    padding-left: 20px;
    margin: 0 0 12px;
  }
  .guide-content :global(li) {
    line-height: 1.7;
    margin-bottom: 4px;
  }
  .guide-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 16px;
    font-size: 13px;
  }
  .guide-content :global(th),
  .guide-content :global(td) {
    border: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
    line-height: 1.6;
  }
  .guide-content :global(th) {
    background: var(--cd-color-fill-1, #f7f8fa);
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .guide-content :global(code) {
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
  }
  .guide-content :global(pre) {
    background: var(--cd-color-fill-1, #f7f8fa);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.6;
  }
  .guide-content :global(pre code) {
    background: none;
    padding: 0;
    font-size: 13px;
  }
</style>
