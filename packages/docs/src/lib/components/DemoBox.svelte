<script lang="ts">
  import type { Snippet } from 'svelte';
  import { highlight } from '$lib/highlight';

  const {
    title,
    description,
    code,
    children,
  }: {
    title?: string;
    description?: string;
    code?: string;
    children: Snippet;
  } = $props();

  let showCode = $state(false);
  let highlighted = $state<string | null>(null);
  let copied = $state(false);

  $effect(() => {
    if (showCode && code && highlighted === null) {
      highlight(code).then((html) => {
        highlighted = html;
      });
    }
  });

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      copied = false;
    }
  }
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
    {#if code}
      <button class="demo-box__toggle" onclick={() => (showCode = !showCode)}>
        {showCode ? '收起代码 ▲' : '查看源码 ▼'}
      </button>
      {#if showCode}
        <button class="demo-box__toggle" onclick={copyCode}>
          {copied ? '已复制 ✓' : '复制'}
        </button>
      {/if}
    {/if}
  </div>
  {#if showCode && code}
    <div class="demo-box__code">
      {#if highlighted}
        {@html highlighted}
      {:else}
        <pre class="demo-box__raw">{code}</pre>
      {/if}
    </div>
  {/if}
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
    display: flex;
    gap: 16px;
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
  .demo-box__code {
    border-top: 1px solid var(--cd-color-border, #e5e7eb);
    background: var(--cd-color-fill-0, #f7f8fa);
    font-size: 13px;
    overflow-x: auto;
  }
  .demo-box__code :global(.shiki) {
    margin: 0;
    padding: 16px;
    background-color: transparent !important;
  }
  .demo-box__raw {
    margin: 0;
    padding: 16px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre;
  }
  :global([data-theme='dark']) .demo-box__code :global(.shiki),
  :global([data-theme='dark']) .demo-box__code :global(.shiki span) {
    color: var(--shiki-dark, inherit) !important;
    background-color: var(--shiki-dark-bg, transparent) !important;
  }
</style>
