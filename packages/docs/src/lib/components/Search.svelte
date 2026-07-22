<script lang="ts">
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { searchSite, searchDocs, type SearchResult } from '$lib/search-index';
  import {
    searchHistory,
    clearSearchHistory,
    pushSearchHistory,
    recentComponents,
  } from '$lib/search-prefs.svelte';
  import SidebarIcon from './SidebarIcon.svelte';

  const lang = $derived(locale.value);

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);

  // 快捷键提示：mac 显示 ⌘，其余平台显示 Ctrl
  const shortcutKey = $derived(
    browser && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl',
  );

  // 组件元信息查表（lowercase name → 驼峰 displayName / 分类 / 标题）：
  // 最近浏览用它渲染彩色图标与本地化名称。
  const compMeta = new Map<string, { displayName: string; category: string }>(
    Object.values(componentsJson.components as Record<string, { name: string; category?: string }>).map(
      (m) => [m.name.toLowerCase(), { displayName: m.name, category: m.category ?? '' }],
    ),
  );
  const docByName = new Map(searchDocs.map((d) => [d.name, d]));

  // 最近浏览：从存的 lowercase name 还原成 { name, displayName, category, title }。
  const recentList = $derived(
    recentComponents.items
      .map((name) => {
        const cm = compMeta.get(name);
        const doc = docByName.get(name);
        if (!cm) return null;
        return { name, displayName: cm.displayName, category: cm.category, title: doc?.title ?? cm.displayName };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  );

  // 快速访问：固定引导入口（真实存在的路由）。icon 用 emoji，简洁对齐 Semi 快速访问区。
  const quickAccess = [
    { icon: '🚀', href: `${base}/guide/getting-started`, label: { zh: 'Getting Started 快速开始', en: 'Getting Started' } },
    { icon: '🧩', href: `${base}/guide/overview`, label: { zh: 'Overview 组件总览', en: 'Overview' } },
    { icon: '🎨', href: `${base}/guide/theming`, label: { zh: 'Theming 主题定制', en: 'Theming' } },
    { icon: '📐', href: `${base}/dsm`, label: { zh: '设计系统管理 DSM', en: 'Design System Manager' } },
  ];

  // ⌘K / Ctrl+K 唤起搜索，Esc 关闭（独立 effect 管理监听挂卸）
  $effect(() => {
    if (!browser) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open = true;
      } else if (e.key === 'Escape') {
        open = false;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // 打开面板时自动聚焦输入框。
  // 刻意保留 query/results：重新打开时沿用上次的搜索词与结果（用户可继续上次的查找），
  // 而非清空回到空态引导。清空由用户手动删除输入触发。
  $effect(() => {
    if (open) inputEl?.focus();
  });

  // 客户端搜索：索引在构建期由 import.meta.glob 扫组件文档生成（见 search-index.ts），
  // dev 与 prod 均可用，纯客户端匹配、无需后端与构建后索引产物。
  function search() {
    results = searchSite(query, 60);
  }

  // 结果按组件分组（对齐 Semi 搜索结果：组件名为组头 + 图标，命中项列其下带「in 章节」归属）。
  interface ResultHit {
    href: string;
    text: string;          // 命中文本（标题级=标题文本；页级=简介或组件名）
    where: string;         // 归属章节（标题级=该标题；页级=「概述」）
  }
  interface ResultGroup {
    name: string;
    displayName: string;
    category: string;
    title: string;
    hits: ResultHit[];
  }
  const groupedResults = $derived.by<ResultGroup[]>(() => {
    const map = new Map<string, ResultGroup>();
    for (const r of results) {
      let g = map.get(r.name);
      if (!g) {
        const cm = compMeta.get(r.name);
        g = {
          name: r.name,
          displayName: cm?.displayName ?? r.name,
          category: cm?.category ?? '',
          title: r.title,
          hits: [],
        };
        map.set(r.name, g);
      }
      if (r.heading) {
        g.hits.push({ href: resultHref(r), text: r.heading.text, where: r.heading.text });
      } else {
        // 页级命中：展示简介，归属「概述」
        g.hits.push({ href: resultHref(r), text: r.brief || r.title, where: t('search.overview', lang) });
      }
    }
    return [...map.values()];
  });

  // 关键词高亮：按多个查询词（空格分隔）切分原文，逐段 HTML 转义后把命中段包 <mark>
  //（避免 XSS 与正则语法错，对齐多词搜索）。
  function highlight(text: string): string {
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return esc(text);
    const pat = terms.map((tm) => tm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return text
      .split(new RegExp(`(${pat})`, 'gi'))
      .map((part, i) => (i % 2 === 1 ? `<mark>${esc(part)}</mark>` : esc(part)))
      .join('');
  }

  // 提交一次搜索（回车 / 点历史标签）：记录关键词到搜索历史。
  function commitSearch(term: string) {
    query = term;
    search();
    pushSearchHistory(term);
  }

  // 命中项链接：页级 -> /components/{name}；标题级 -> 追加 #锚点（与 TOC 一致）。
  function resultHref(r: SearchResult): string {
    const hash = r.heading ? `#${r.heading.anchor}` : '';
    return `${base}/components/${r.name}${hash}`;
  }

  // 点击结果 / 条目后关闭面板，并把当前词记入历史（有输入时）。
  function closeAndRecord() {
    if (query.trim()) pushSearchHistory(query);
    open = false;
  }
</script>

<div class="search-wrap">
  <button class="search-trigger" onclick={() => open = !open} aria-label={t('nav.search', lang)}>
    <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
    </svg>
    <span class="search-label">{t('nav.search', lang)}</span>
    <kbd class="search-kbd">{shortcutKey} K</kbd>
  </button>
  {#if open}
  <!-- 遮罩 + 居中弹窗（对齐 Semi 搜索弹窗）。点遮罩关闭；面板内点击不冒泡到遮罩。Esc 全局关闭已处理。 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="search-overlay" onclick={() => (open = false)}>
    <!-- 弹窗容器：onclick 仅阻止冒泡到遮罩（非交互动作，无需键盘等价）；Esc 全局关闭已在 keydown effect 处理 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="search-modal" role="dialog" aria-modal="true" tabindex="-1" aria-label={t('nav.search', lang)} onclick={(e) => e.stopPropagation()}>
      <div class="search-modal-input">
        <svg class="search-modal-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
        </svg>
        <input
          type="search"
          placeholder={t('search.placeholder', lang)}
          bind:this={inputEl}
          bind:value={query}
          oninput={search}
          onkeydown={(e) => { if (e.key === 'Enter' && query.trim()) commitSearch(query); }}
          class="search-input"
        />
      </div>

      <div class="search-modal-body">
        {#if query}
          {#if groupedResults.length > 0}
          <div class="result-groups">
            <div class="group-label">{t('search.components', lang)}</div>
            {#each groupedResults as g}
              <div class="result-group">
                <a class="group-head" href="{base}/components/{g.name}" onclick={closeAndRecord}>
                  <SidebarIcon name={g.name} displayName={g.displayName} category={g.category} size={24} />
                  <span class="group-title">{g.title}</span>
                </a>
                <ul class="group-hits">
                  {#each g.hits as hit}
                    <li>
                      <a href={hit.href} onclick={closeAndRecord}>
                        <span class="hit-text">{@html highlight(hit.text)}</span>
                        <span class="hit-where">{t('search.in', lang)} {hit.where}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
          {:else}
          <p class="search-empty">{t('search.empty', lang)}</p>
          {/if}
        {:else}
        <!-- 空态引导：搜索历史 / 最近浏览 / 快速访问（对齐 Semi 搜索面板） -->
        <div class="search-idle">
          {#if searchHistory.items.length > 0}
          <div class="idle-section">
            <div class="idle-head">
              <span class="idle-title">{t('search.history', lang)}</span>
              <button class="idle-clear" type="button" onclick={clearSearchHistory}>{t('search.clear', lang)}</button>
            </div>
            <div class="history-tags">
              {#each searchHistory.items as term}
                <button class="history-tag" type="button" onclick={() => commitSearch(term)}>{term}</button>
              {/each}
            </div>
          </div>
          {/if}

          {#if recentList.length > 0}
          <div class="idle-section">
            <div class="idle-head"><span class="idle-title">{t('search.recent', lang)}</span></div>
            <ul class="idle-list">
              {#each recentList as item}
                <li>
                  <a href="{base}/components/{item.name}" onclick={() => (open = false)}>
                    <SidebarIcon name={item.name} displayName={item.displayName} category={item.category} size={24} />
                    <span class="idle-item-label">{item.title}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          <div class="idle-section">
            <div class="idle-head"><span class="idle-title">{t('search.quick', lang)}</span></div>
            <ul class="idle-list">
              {#each quickAccess as q}
                <li>
                  <a href={q.href} onclick={() => (open = false)}>
                    <span class="quick-icon" aria-hidden="true">{q.icon}</span>
                    <span class="idle-item-label">{lang === 'en' ? q.label.en : q.label.zh}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        {/if}
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  .search-wrap { position: relative; }
  .search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--cd-color-fill-1, #f2f3f5);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 7px 10px 7px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    min-width: 180px;
    transition: border-color 0.15s, background 0.15s;
  }
  .search-trigger:hover {
    border-color: var(--cd-color-border, #e5e7eb);
    background: var(--cd-color-bg-0, #fff);
  }
  .search-icon { flex-shrink: 0; }
  .search-label { margin-right: auto; }
  .search-kbd {
    font-family: inherit;
    font-size: 12px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 5px;
    background: var(--cd-color-bg-0, #fff);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    color: var(--cd-color-text-2, #86909c);
  }
  /* —— 遮罩 + 居中弹窗（对齐 Semi 搜索弹窗，顶部偏上） —— */
  .search-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0, 0, 0, 0.45);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 10vh 16px 16px;
  }
  .search-modal {
    width: min(720px, 100%);
    max-height: 76vh;
    display: flex; flex-direction: column;
    background: var(--cd-color-bg-0, #fff);
    border-radius: 12px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
    overflow: hidden;
  }
  .search-modal-input {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    flex-shrink: 0;
  }
  .search-modal-icon { flex-shrink: 0; color: var(--cd-color-text-2, #86909c); }
  .search-input {
    flex: 1; min-width: 0;
    border: none; outline: none; background: none;
    font-size: 16px; color: var(--cd-color-text-0, #1f2329);
  }
  .search-modal-body {
    overflow-y: auto;
    padding: 8px 12px 12px;
  }
  .search-empty { padding: 24px 8px; text-align: center; font-size: 14px; color: var(--cd-color-text-2, #86909c); }

  /* —— 分组结果（组件名为组头 + 图标，命中项列其下带「in 章节」） —— */
  .group-label { font-size: 12px; color: var(--cd-color-text-2, #86909c); padding: 8px 8px 4px; }
  .result-group { margin-bottom: 6px; }
  .group-head {
    display: flex; align-items: center; gap: 12px;
    padding: 8px; border-radius: 8px; text-decoration: none;
    background: none;
    color: var(--cd-color-text-0, #1f2329);
  }
  .group-head:hover { background: var(--cd-color-fill-1, #f2f3f5); }
  .group-title { font-size: 15px; font-weight: 600; }
  .group-hits { list-style: none; margin: 2px 0 0; padding: 0; }
  .group-hits li a {
    display: block; padding: 7px 8px 7px 48px; border-radius: 6px; text-decoration: none;
  }
  .group-hits li a:hover { background: var(--cd-color-fill-1, #f2f3f5); }
  .hit-text { display: block; font-size: 14px; color: var(--cd-color-text-0, #1f2329); }
  .hit-text :global(mark) { background: transparent; color: var(--cd-color-primary, #2f6bff); padding: 0; }
  .hit-where { display: block; font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-top: 1px; }

  /* —— 空态引导：搜索历史 / 最近浏览 / 快速访问 —— */
  .search-idle { padding: 4px 0; }
  .idle-section { padding: 4px 0; }
  .idle-section + .idle-section { margin-top: 8px; }
  .idle-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 8px;
  }
  .idle-title { font-size: 12px; color: var(--cd-color-text-2, #86909c); }
  .idle-clear {
    border: none; background: none; cursor: pointer; padding: 0;
    font-size: 12px; color: var(--cd-color-primary, #2f6bff);
  }
  .idle-clear:hover { text-decoration: underline; }
  .history-tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 8px 2px; }
  .history-tag {
    border: none; cursor: pointer;
    padding: 4px 12px; border-radius: 999px;
    background: var(--cd-color-fill-1, #f2f3f5);
    color: var(--cd-color-text-1, #4e5969);
    font-size: 13px; line-height: 1.4;
    transition: background 0.15s;
  }
  .history-tag:hover { background: var(--cd-color-fill-2, #e5e6eb); }
  .idle-list { list-style: none; margin: 0; padding: 0; }
  .idle-list li a {
    display: flex; align-items: center; gap: 12px;
    padding: 7px 8px; border-radius: 6px; text-decoration: none;
    color: var(--cd-color-text-0, #1f2329); font-size: 14px;
  }
  .idle-list li a:hover { background: var(--cd-color-fill-1, #f2f3f5); }
  .idle-item-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .quick-icon {
    width: 22px; height: 22px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
</style>
