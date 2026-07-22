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
    <a href="{base}/" class="docs-logo" aria-label="chenzy design">
      <!-- 单 svg logo（Semi 形式：自由图形标 + 双行文字标合成一个 svg；图形不照搬 Semi）。
           图形标：无外框的「c」形开口圆环（chenzy 首字母，深色）+ 缺口处一枚主色圆点，轻盈有辨识度；
           文字标：chenzy / design 两行，同字重紧凑排版，currentColor 随主题变色。尺寸对齐 Semi(高36)。 -->
      <svg
        class="logo"
        viewBox="0 0 152 44"
        height="36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="chenzy design"
      >
        <!-- 图形标：深色实心圆 + 主色月牙咬合，负空间构成「c」缺口，双色层次、有体块感 -->
        <!-- 深色主体圆 -->
        <circle cx="20" cy="22" r="16" fill="currentColor" />
        <!-- 负空间缺口：用底色圆咬出「c」开口（右侧） -->
        <circle cx="27" cy="22" r="8.5" fill="var(--cd-color-bg-0, #fff)" />
        <!-- 主色月牙：填回缺口内侧一弧，形成双色咬合层次 -->
        <path
          d="M27 13.5a8.5 8.5 0 010 17 6 6 0 000-17z"
          fill="var(--cd-color-primary, #0064fa)"
        />
        <!-- 文字标（两行、大而粗、紧凑；currentColor 随主题） -->
        <text
          x="49"
          y="20.5"
          fill="currentColor"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-size="20.5"
          font-weight="800"
          letter-spacing="-0.6"
        >chenzy</text>
        <text
          x="49"
          y="40"
          fill="currentColor"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-size="20.5"
          font-weight="800"
          letter-spacing="-0.6"
        >design</text>
      </svg>
    </a>
    <nav class="docs-header-nav">
      <!-- 顶部一级导航对齐 Semi 官网（组件/主题/设计转代码/模板/数据可视化/博客）。
           组件已实现（可点）；其余页面暂未实现，保持灰色占位（对齐 Semi 项，功能后续补）。 -->
      <a href="{base}/components" class:active={$page.url.pathname.startsWith(`${base}/components`)}>
        {t('nav.components', lang)}
      </a>
      <span class="nav-placeholder">{lang === 'zh' ? '主题' : 'Theme'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '设计转代码' : 'Design to Code'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '模板' : 'Templates'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '数据可视化' : 'Data Visualization'}</span>
      <span class="nav-placeholder">{lang === 'zh' ? '博客' : 'Blog'}</span>
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
    <main class="docs-main docs-main--full">
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
    text-decoration: none;
    color: var(--cd-color-text-0, #1f2329);
    /* 自然宽度（对齐 Semi：logo 后紧跟一级导航，不占满侧栏列宽）。 */
    flex-shrink: 0;
  }
  .logo {
    flex-shrink: 0;
    display: block;
    color: var(--cd-color-text-0, #1f2329);
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
