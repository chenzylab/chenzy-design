<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    title,
    description,
    children,
  }: {
    title?: string;
    description?: string;
    children: Snippet;
  } = $props();

  let showCode = $state(false);
</script>

<div class="demo-box">
  {#if title}
    <div class="demo-box__title">{title}</div>
  {/if}
  {#if description}
    <p class="demo-box__desc">{description}</p>
  {/if}
  <div class="demo-box__preview">
    {@render children()}
  </div>
  <div class="demo-box__footer">
    <button class="demo-box__toggle" onclick={() => (showCode = !showCode)}>
      {showCode ? '收起代码 ▲' : '查看源码 ▼'}
    </button>
  </div>
</div>

<style>
  .demo-box {
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
  }
  .demo-box__title {
    padding: 12px 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .demo-box__desc {
    padding: 4px 16px 0;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    margin: 0;
  }
  .demo-box__preview {
    padding: 24px 16px;
  }
  .demo-box__footer {
    border-top: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 8px 16px;
  }
  .demo-box__toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    padding: 0;
  }
  .demo-box__toggle:hover {
    color: var(--cd-color-primary, #165dff);
  }
</style>
