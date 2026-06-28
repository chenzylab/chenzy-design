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
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { componentNamesZh } from '$lib/component-names-zh';

  const { children }: { children: Snippet } = $props();

  const lang = $derived(locale.value);

  // 按 category 分组（label key 走 i18n）
  const categoryKey: Record<string, string> = {
    basic: 'cat.basic',
    input: 'cat.input',
    navigation: 'cat.navigation',
    show: 'cat.show',
    feedback: 'cat.feedback',
    other: 'cat.other',
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

  // 全局文档分组（对齐 Semi 左侧「开始 / 体验增强」）。label 中英双版。
  const guideGroups = [
    {
      titleKey: 'group.start',
      items: [
        { zh: 'Introduction 介绍', en: 'Introduction', href: '/guide/introduction' },
        { zh: 'Getting Started 快速开始', en: 'Getting Started', href: '/guide/getting-started' },
        { zh: 'Overview 组件总览', en: 'Overview', href: '/guide/overview' },
      ],
    },
    {
      titleKey: 'group.experience',
      items: [
        { zh: 'Accessibility 无障碍', en: 'Accessibility', href: '/guide/accessibility' },
        { zh: 'Internationalization 国际化', en: 'Internationalization', href: '/guide/i18n' },
        { zh: 'Content Guidelines 文案规范', en: 'Content Guidelines', href: '/guide/content-guidelines' },
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
    <a href="{base}/" class="docs-logo">
      <svg class="logo-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #165dff)" />
        <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #165dff)" opacity="0.55" />
        <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #165dff)" opacity="0.55" />
        <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #165dff)" />
      </svg>
      <span class="logo-text">chenzy-design</span>
    </a>
    <nav class="docs-header-nav">
      <a href="{base}/components" class:active={$page.url.pathname.startsWith(`${base}/components`)}>
        {t('nav.components', lang)}
      </a>
      <!-- 占位一级导航：对齐 Semi 多 Tab 顶栏观感，功能后续补 -->
      <span class="nav-placeholder">{lang === 'zh' ? '主题' : 'Theme'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '模板' : 'Templates'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '资源' : 'Resources'}</span>
    </nav>
    <div class="docs-header-actions">
      <Search />
      <a
        class="icon-btn"
        href="https://github.com/chenzylab/chenzy-design"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
      >
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
      <button class="icon-btn" onclick={() => locale.toggle()} aria-label="切换语言 / Switch language">
        <span class="lang-text">{lang === 'zh' ? 'EN' : '中'}</span>
      </button>
      <button class="icon-btn" onclick={toggleTheme} aria-label="切换主题 / Toggle theme">
        {#if theme === 'light'}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke-linecap="round" />
          </svg>
        {/if}
      </button>
    </div>
  </header>

  <div class="docs-body">
    <aside class="docs-sidebar">
      {#each guideGroups as group (group.titleKey)}
        <div class="sidebar-group">
          <div class="sidebar-group-title">{t(group.titleKey, lang)}</div>
          {#each group.items as item (item.href)}
            <a
              href="{base}{item.href}"
              class="sidebar-item"
              class:active={$page.url.pathname === `${base}${item.href}`}
            >
              {lang === 'zh' ? item.zh : item.en}
            </a>
          {/each}
        </div>
      {/each}
      {#each categoryOrder as cat}
        {#if grouped[cat]}
          <div class="sidebar-group">
            <div class="sidebar-group-title">{t(categoryKey[cat] ?? cat, lang)}</div>
            {#each grouped[cat] as comp}
              {@const name = comp.name.toLowerCase()}
              <a
                href="{base}/components/{name}"
                class="sidebar-item"
                class:active={$page.url.pathname === `${base}/components/${name}`}
              >
                {comp.name}{#if lang === 'zh' && componentNamesZh[name]}<span class="sidebar-item-zh">{componentNamesZh[name]}</span>{/if}
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
    gap: 40px;
    padding: 0 24px;
    height: 60px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    position: sticky;
    top: 0;
    background: var(--cd-color-bg-0, #fff);
    z-index: 100;
  }
  .docs-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    text-decoration: none;
    color: var(--cd-color-text-0, #1f2329);
    /* 与左侧栏宽度对齐：logo 区占据侧栏列宽，一级导航从内容区起始处开始（对齐 Semi） */
    width: calc(260px - 24px);
    flex-shrink: 0;
  }
  .logo-mark {
    flex-shrink: 0;
  }
  .docs-header-nav {
    display: flex;
    align-items: center;
    gap: 28px;
  }
  .docs-header-nav a {
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
    font-size: 15px;
    transition: color 0.15s;
  }
  .docs-header-nav a:hover,
  .docs-header-nav a.active {
    color: var(--cd-color-text-0, #1f2329);
    font-weight: 500;
  }
  /* 占位导航：弱化、不可点观感 */
  .nav-placeholder {
    font-size: 15px;
    color: var(--cd-color-text-3, #c9cdd4);
    cursor: default;
  }
  .docs-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  /* 统一圆形图标按钮（GitHub / 语言 / 主题），对齐 Semi 右侧图标排 */
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--cd-color-text-1, #4e5969);
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .icon-btn:hover {
    background: var(--cd-color-fill-1, #f2f3f5);
    color: var(--cd-color-text-0, #1f2329);
  }
  .lang-text {
    font-size: 13px;
    font-weight: 600;
  }
  .docs-body {
    display: flex;
    flex: 1;
  }
  .docs-sidebar {
    width: 260px;
    flex-shrink: 0;
    border-right: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 16px 0;
    overflow-y: auto;
    position: sticky;
    top: 60px;
    height: calc(100vh - 60px);
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
  /* 中文环境下的中文名：弱化的次要色，跟在英文名后（对齐 Semi 双名侧栏） */
  .sidebar-item-zh {
    margin-left: 6px;
    color: var(--cd-color-text-3, #a9aeb8);
    font-size: 12px;
  }
  .sidebar-item.active .sidebar-item-zh {
    color: var(--cd-color-primary, #165dff);
    opacity: 0.7;
  }
  .docs-main {
    flex: 1;
    padding: 32px 56px;
    max-width: 1440px;
    min-width: 0;
  }
</style>
