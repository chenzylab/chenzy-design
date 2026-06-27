<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import '@chenzy-design/tokens/tokens.css';
  import 'uno.css';
  import '../app.css';
  import Search from '$lib/components/Search.svelte';

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

  // 全局文档分组（对齐 Semi 左侧「开始 / 体验增强」）
  const guideGroups = [
    {
      title: '开始',
      items: [
        { label: 'Introduction 介绍', href: '/guide/introduction' },
        { label: 'Getting Started 快速开始', href: '/guide/getting-started' },
        { label: 'Overview 组件总览', href: '/guide/overview' },
      ],
    },
    {
      title: '体验增强',
      items: [
        { label: 'Accessibility 无障碍', href: '/guide/accessibility' },
        { label: 'Internationalization 国际化', href: '/guide/i18n' },
        { label: 'Content Guidelines 文案规范', href: '/guide/content-guidelines' },
      ],
    },
  ];

  let theme = $state('light');

  if (browser) {
    const saved = localStorage.getItem('cd-theme');
    if (saved) {
      theme = saved;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    if (browser) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('cd-theme', theme);
    }
  }

  $effect(() => {
    if (browser) document.documentElement.setAttribute('data-theme', theme);
  });
</script>

<div class="docs-layout">
  <header class="docs-header">
    <a href="{base}/" class="docs-logo">chenzy-design</a>
    <nav class="docs-header-nav">
      <a href="{base}/components">组件</a>
    </nav>
    <div class="docs-header-actions">
      <Search />
      <button class="theme-toggle" onclick={toggleTheme} aria-label="切换主题">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  </header>

  <div class="docs-body">
    <aside class="docs-sidebar">
      {#each guideGroups as group (group.title)}
        <div class="sidebar-group">
          <div class="sidebar-group-title">{group.title}</div>
          {#each group.items as item (item.href)}
            <a
              href="{base}{item.href}"
              class="sidebar-item"
              class:active={$page.url.pathname === `${base}${item.href}`}
            >
              {item.label}
            </a>
          {/each}
        </div>
      {/each}
      {#each categoryOrder as cat}
        {#if grouped[cat]}
          <div class="sidebar-group">
            <div class="sidebar-group-title">{categoryLabels[cat] ?? cat}</div>
            {#each grouped[cat] as comp}
              {@const name = comp.name.toLowerCase()}
              <a
                href="{base}/components/{name}"
                class="sidebar-item"
                class:active={$page.url.pathname === `${base}/components/${name}`}
              >
                {comp.name}
              </a>
            {/each}
          </div>
        {/if}
      {/each}
    </aside>

    <main class="docs-main" data-pagefind-body>
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
  .docs-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .theme-toggle {
    background: none;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: var(--cd-color-text-1, #4e5969);
  }
  .theme-toggle:hover {
    background: var(--cd-color-fill-1, #f2f3f5);
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
