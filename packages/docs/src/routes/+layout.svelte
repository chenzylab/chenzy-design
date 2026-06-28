<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';
  import '@chenzy-design/tokens/tokens.css';
  import 'uno.css';
  import '../app.css';
  import Search from '$lib/components/Search.svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const { children }: { children: Snippet } = $props();

  const lang = $derived(locale.value);

  // 首页（/）走全宽无侧边栏；其余路由由 (app) 分组 layout 套上侧边栏两栏布局
  const isHome = $derived(
    $page.url.pathname === base || $page.url.pathname === `${base}/`,
  );

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
        <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
        <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
        <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
        <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
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

  {#if isHome}
    <!-- 首页：全宽落地页，无侧边栏（对齐 Semi 首页） -->
    <main class="docs-main docs-main--full" data-pagefind-body>
      {@render children()}
    </main>
  {:else}
    <!-- 其余路由由 (app)/+layout.svelte 提供侧边栏两栏布局 -->
    {@render children()}
  {/if}
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
  /* 首页全宽主区（无侧边栏） */
  .docs-main--full {
    flex: 1;
    padding: 32px 24px;
    min-width: 0;
  }
</style>
