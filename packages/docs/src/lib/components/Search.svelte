<script lang="ts">
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { searchSite, type SearchResult } from '$lib/search-index';

  const lang = $derived(locale.value);

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let open = $state(false);

  // 快捷键提示：mac 显示 ⌘，其余平台显示 Ctrl
  const shortcutKey = $derived(
    browser && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl',
  );

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

  // 客户端搜索：索引在构建期由 import.meta.glob 扫组件文档生成（见 search-index.ts），
  // dev 与 prod 均可用，纯客户端匹配、无需后端与构建后索引产物。
  function search() {
    results = searchSite(query);
  }

  // 命中项链接：页级 -> /components/{name}；标题级 -> 追加 #锚点（与 TOC 一致）。
  function resultHref(r: SearchResult): string {
    const hash = r.heading ? `#${r.heading.anchor}` : '';
    return `${base}/components/${r.name}${hash}`;
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
  <div class="search-panel">
    <input
      type="search"
      placeholder={t('search.placeholder', lang)}
      bind:value={query}
      oninput={search}
      class="search-input"
    />
    {#if results.length > 0}
    <ul class="search-results">
      {#each results as result}
        <li>
          <a href={resultHref(result)} onclick={() => open = false}>
            <span class="result-title">
              {result.title}{#if result.heading}<span class="result-crumb"> › {result.heading.text}</span>{/if}
            </span>
            {#if result.brief}<span class="result-excerpt">{result.brief}</span>{/if}
          </a>
        </li>
      {/each}
    </ul>
    {:else if query}
    <p class="search-empty">{t('search.empty', lang)}</p>
    {/if}
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
  .search-panel {
    position: absolute; top: calc(100% + 8px); right: 0;
    width: 360px; background: var(--cd-color-bg-0, #fff);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.12);
    z-index: 200; padding: 8px;
  }
  .search-input {
    width: 100%; padding: 8px 12px; border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box;
    background: var(--cd-color-bg-1, #f7f8fa); color: var(--cd-color-text-0, #1f2329);
  }
  .search-results { list-style: none; margin: 8px 0 0; padding: 0; }
  .search-results li a {
    display: block; padding: 8px; border-radius: 6px; text-decoration: none;
    color: var(--cd-color-text-0, #1f2329);
  }
  .search-results li a:hover { background: var(--cd-color-fill-1, #f2f3f5); }
  .result-title { display: block; font-size: 13px; font-weight: 600; }
  .result-crumb { font-weight: 400; color: var(--cd-color-text-2, #86909c); }
  .result-excerpt { display: block; font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-top: 2px; }
  .search-empty { padding: 8px; font-size: 13px; color: var(--cd-color-text-2, #86909c); }
</style>
