<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import type { Snippet } from 'svelte';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { componentNamesZh } from '$lib/component-names-zh';
  import SidebarIcon from '$lib/components/SidebarIcon.svelte';

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
      const cat = (meta as { category?: string }).category ?? 'other';
      (acc[cat] ??= []).push(meta as { name: string; category?: string });
      return acc;
    },
    {} as Record<string, { name: string; category?: string }[]>,
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
</script>

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
    {#each categoryOrder as cat (cat)}
      {#if grouped[cat]}
        <div class="sidebar-group">
          <div class="sidebar-group-title">{t(categoryKey[cat] ?? cat, lang)}</div>
          {#each grouped[cat] as comp (comp.name)}
            {@const name = comp.name.toLowerCase()}
            <a
              href="{base}/components/{name}"
              class="sidebar-item"
              class:active={$page.url.pathname === `${base}/components/${name}`}
            >
              <SidebarIcon {name} category={comp.category ?? 'other'} />
              <span class="sidebar-item-label"
                >{comp.name}{#if lang === 'zh' && componentNamesZh[name]}<span class="sidebar-item-zh"
                    >{componentNamesZh[name]}</span
                  >{/if}</span
              >
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

<style>
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px 6px 16px;
    font-size: 13px;
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
    border-radius: 0 20px 20px 0;
    margin-right: 12px;
    transition: background 0.15s;
  }
  .sidebar-item-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sidebar-item:hover {
    background: var(--cd-color-fill-1, #f2f3f5);
  }
  .sidebar-item.active {
    background: var(--cd-color-primary-light-1, #eaf5ff);
    color: var(--cd-color-primary, #0064fa);
    font-weight: 500;
  }
  /* 中文环境下的中文名：弱化的次要色，跟在英文名后（对齐 Semi 双名侧栏） */
  .sidebar-item-zh {
    margin-left: 6px;
    color: var(--cd-color-text-3, #a9aeb8);
    font-size: 12px;
  }
  .sidebar-item.active .sidebar-item-zh {
    color: var(--cd-color-primary, #0064fa);
    opacity: 0.7;
  }
  .docs-main {
    flex: 1;
    padding: 32px 56px;
    max-width: 1440px;
    min-width: 0;
  }
</style>
