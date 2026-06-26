<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let query = $state('');
  let results = $state<any[]>([]);
  let pagefind: any = null;
  let open = $state(false);

  onMount(async () => {
    if (!browser) return;
    try {
      // @ts-ignore
      pagefind = await import('/pagefind/pagefind.js');
      await pagefind.init();
    } catch {
      // pagefind 仅在 build 后可用，dev 模式跳过
    }
  });

  async function search() {
    if (!pagefind || !query.trim()) { results = []; return; }
    const res = await pagefind.search(query);
    results = await Promise.all(res.results.slice(0, 8).map((r: any) => r.data()));
  }
</script>

<div class="search-wrap">
  <button class="search-trigger" onclick={() => open = !open} aria-label="搜索">
    🔍 搜索
  </button>
  {#if open}
  <div class="search-panel">
    <input
      type="search"
      placeholder="搜索组件..."
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
    <p class="search-empty">未找到相关结果</p>
    {/if}
  </div>
  {/if}
</div>

<style>
  .search-wrap { position: relative; }
  .search-trigger {
    background: none; border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px; padding: 4px 12px; cursor: pointer; font-size: 13px;
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
