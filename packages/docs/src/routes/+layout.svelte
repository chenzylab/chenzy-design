<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import '@chenzy-design/tokens/tokens.css';
  import 'uno.css';
  import '../app.css';

  const { children }: { children: Snippet } = $props();

  // 按 category 分组
  const categoryLabels: Record<string, string> = {
    basic: '基础',
    input: '输入',
    navigation: '导航',
    show: '展示',
    feedback: '反馈',
    other: '其他',
  };

  const grouped = Object.entries(componentsJson.components).reduce(
    (acc, [, meta]) => {
      const cat = (meta as any).category ?? 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(meta as any);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const categoryOrder = ['basic', 'input', 'navigation', 'show', 'feedback', 'other'];
</script>

<div class="docs-layout">
  <header class="docs-header">
    <a href="/" class="docs-logo">chenzy-design</a>
    <nav class="docs-header-nav">
      <a href="/components">组件</a>
    </nav>
  </header>

  <div class="docs-body">
    <aside class="docs-sidebar">
      {#each categoryOrder as cat}
        {#if grouped[cat]}
          <div class="sidebar-group">
            <div class="sidebar-group-title">{categoryLabels[cat] ?? cat}</div>
            {#each grouped[cat] as comp}
              {@const name = comp.name.toLowerCase()}
              <a
                href="/components/{name}"
                class="sidebar-item"
                class:active={$page.url.pathname === `/components/${name}`}
              >
                {comp.name}
              </a>
            {/each}
          </div>
        {/if}
      {/each}
    </aside>

    <main class="docs-main">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .docs-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: var(--cd-font-family, system-ui, sans-serif);
  }
  .docs-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 24px;
    height: 56px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    position: sticky;
    top: 0;
    background: var(--cd-color-bg-0, #fff);
    z-index: 100;
  }
  .docs-logo {
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    color: var(--cd-color-text-0, #1f2329);
  }
  .docs-header-nav a {
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
    font-size: 14px;
  }
  .docs-body {
    display: flex;
    flex: 1;
  }
  .docs-sidebar {
    width: 220px;
    flex-shrink: 0;
    border-right: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 16px 0;
    overflow-y: auto;
    position: sticky;
    top: 56px;
    height: calc(100vh - 56px);
  }
  .sidebar-group {
    margin-bottom: 8px;
  }
  .sidebar-group-title {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    color: var(--cd-color-text-2, #86909c);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .sidebar-item {
    display: block;
    padding: 6px 16px 6px 24px;
    font-size: 13px;
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
    border-radius: 0 20px 20px 0;
    margin-right: 12px;
    transition: background 0.15s;
  }
  .sidebar-item:hover {
    background: var(--cd-color-fill-1, #f2f3f5);
  }
  .sidebar-item.active {
    background: var(--cd-color-primary-light-1, #e8f3ff);
    color: var(--cd-color-primary, #165dff);
    font-weight: 500;
  }
  .docs-main {
    flex: 1;
    padding: 32px 48px;
    max-width: 900px;
    min-width: 0;
  }
</style>
