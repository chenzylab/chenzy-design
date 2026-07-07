<script lang="ts">
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  let query = $state('');
  let results = $state<any[]>([]);
  let pagefind: any = null;
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

  onMount(async () => {
    if (!browser) return;
    try {
      // 用 new Function 包裹动态 import，阻止 Vite/Rollup 在构建期静态解析
      // `pagefind.js`（该文件由 pagefind 在 build 之后生成，构建期不存在）。
      // 路径须带 base：GitHub Pages 部署在 /chenzy-design 子路径下，
      // 否则请求 /pagefind/pagefind.js 会 404（正确为 {base}/pagefind/pagefind.js）。
      const dynamicImport = new Function('p', 'return import(p)');
      pagefind = await dynamicImport(`${base}/pagefind/pagefind.js`);
      await pagefind.init();
    } catch {
      // pagefind 仅在 build 后可用，dev 模式静默跳过
    }
  });

  async function search() {
    if (!pagefind || !query.trim()) { results = []; return; }
    const res = await pagefind.search(query);
    results = await Promise.all(res.results.slice(0, 8).map((r: any) => r.data()));
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
          <a href={result.url} onclick={() => open = false}>
            <span class="result-title">{result.meta?.title ?? result.url}</span>
            <span class="result-excerpt">{@html result.excerpt}</span>
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
  .result-excerpt { display: block; font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-top: 2px; }
  .search-empty { padding: 8px; font-size: 13px; color: var(--cd-color-text-2, #86909c); }
</style>
