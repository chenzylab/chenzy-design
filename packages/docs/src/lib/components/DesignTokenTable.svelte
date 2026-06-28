<script lang="ts">
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import tokensDetail from '$lib/data/tokens-detail.json';

  const lang = $derived(locale.value);

  interface TokenDetail {
    name: string;
    value: string;
    category: string;
    component: string | null;
    usage: string;
  }

  // component：组件名（小写，如 'dropdown'）。仅展示该组件专属变量；null 时展示全部。
  const { component = null }: { component?: string | null } = $props();

  const allTokens = (tokensDetail as { tokens: TokenDetail[] }).tokens;

  // 该页相关 token：组件专属变量。
  // component 为 null → 展示全部；为 '' → 视为「无专属变量」展示空态（区别于 null）。
  const scoped = $derived(
    component === null
      ? allTokens
      : component === ''
        ? []
        : allTokens.filter((tk) => tk.component === component),
  );

  // 类别 tab：仅展示该组件实际拥有的类别，按固定顺序
  const CATEGORY_ORDER = [
    'animation',
    'color',
    'font',
    'height',
    'other',
    'radius',
    'spacing',
    'width',
  ];
  const categories = $derived(
    CATEGORY_ORDER.filter((c) => scoped.some((tk) => tk.category === c)),
  );

  // 用户点选的类别（null = 跟随默认）。effective 类别从 categories 派生，
  // 避免在 $effect 内写 $state：切换组件时 picked 若失效自动回落到首个类别。
  let pickedCat = $state<string | null>(null);
  const activeCat = $derived(
    pickedCat && categories.includes(pickedCat) ? pickedCat : (categories[0] ?? ''),
  );

  const PAGE_SIZE = 10;
  // 用户点选的页码（null = 第 1 页）。effective 页码从总页数派生并夹取，
  // 切 tab 时 rows 变化 → totalPages 变化 → page 自动落回有效范围。
  let pickedPage = $state<number | null>(null);

  const rows = $derived(scoped.filter((tk) => tk.category === activeCat));
  const total = $derived(rows.length);
  const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const page = $derived(pickedPage ? Math.min(pickedPage, totalPages) : 1);

  const pageRows = $derived(rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  const from = $derived(total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1);
  const to = $derived(Math.min(page * PAGE_SIZE, total));

  // 判定是否为可预览的颜色值（直接色值，或解析为色值的别名在此不展开，仅对字面色块预览）
  function colorSwatch(value: string): string | null {
    const v = value.trim();
    if (/^#([0-9a-f]{3,8})$/i.test(v)) return v;
    if (/^rgba?\(/i.test(v) || /^hsla?\(/i.test(v)) return v;
    return null;
  }

  function selectCat(cat: string) {
    pickedCat = cat;
    pickedPage = 1; // 切 tab 回到第 1 页
  }

  function go(p: number) {
    if (p >= 1 && p <= totalPages) pickedPage = p;
  }
</script>

{#if scoped.length === 0}
  <p class="empty">{t('token.empty', lang)}</p>
{:else}
  <div class="dtt">
    <div class="dtt-tabs" role="tablist">
      {#each categories as cat (cat)}
        <button
          class="dtt-tab"
          class:active={activeCat === cat}
          role="tab"
          aria-selected={activeCat === cat}
          onclick={() => selectCat(cat)}
        >
          {cat}
        </button>
      {/each}
    </div>

    <table class="dtt-table">
      <thead>
        <tr>
          <th class="col-var">{t('token.var', lang)}</th>
          <th class="col-val">{t('token.value', lang)}</th>
          <th class="col-usage">{t('token.usage', lang)}</th>
        </tr>
      </thead>
      <tbody>
        {#each pageRows as tk (tk.name)}
          <tr>
            <td class="col-var"><code>{tk.name}</code></td>
            <td class="col-val">
              {#if colorSwatch(tk.value)}
                <span class="swatch" style:background={colorSwatch(tk.value)}></span>
              {/if}
              <code class="val">{tk.value}</code>
            </td>
            <td class="col-usage">{tk.usage}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="dtt-footer">
      <span class="dtt-range">
        {t('token.range', lang, { from, to, total })}
      </span>
      {#if totalPages > 1}
        <div class="dtt-pager">
          <button
            class="pager-btn"
            disabled={page <= 1}
            aria-label="Prev"
            onclick={() => go(page - 1)}>‹</button
          >
          {#each Array(totalPages) as _, i (i)}
            <button
              class="pager-btn"
              class:active={page === i + 1}
              aria-current={page === i + 1 ? 'page' : undefined}
              onclick={() => go(i + 1)}>{i + 1}</button
            >
          {/each}
          <button
            class="pager-btn"
            disabled={page >= totalPages}
            aria-label="Next"
            onclick={() => go(page + 1)}>›</button
          >
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .empty {
    color: var(--cd-color-text-2, #86909c);
    font-size: 14px;
    padding: 16px 0;
  }
  .dtt-tabs {
    display: flex;
    gap: 24px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    margin-bottom: 4px;
    overflow-x: auto;
  }
  .dtt-tab {
    background: none;
    border: none;
    padding: 10px 0;
    font-size: 14px;
    color: var(--cd-color-text-2, #86909c);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
  }
  .dtt-tab:hover {
    color: var(--cd-color-text-0, #1f2329);
  }
  .dtt-tab.active {
    color: var(--cd-color-primary, #0064fa);
    border-bottom-color: var(--cd-color-primary, #0064fa);
    font-weight: 500;
  }
  .dtt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    table-layout: fixed;
  }
  .dtt-table th {
    text-align: left;
    padding: 12px;
    color: var(--cd-color-text-2, #86909c);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .dtt-table td {
    padding: 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
    word-break: break-word;
  }
  .dtt-table tbody tr:hover {
    background: var(--cd-color-fill-0, #f7f8fa);
  }
  .col-var {
    width: 38%;
  }
  .col-val {
    width: 32%;
  }
  .col-usage {
    width: 30%;
    color: var(--cd-color-text-1, #4e5969);
  }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
  }
  .col-var code {
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .val {
    color: var(--cd-color-text-1, #4e5969);
  }
  .swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: -2px;
    margin-right: 6px;
  }
  .dtt-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
  }
  .dtt-pager {
    display: flex;
    gap: 4px;
  }
  .pager-btn {
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    background: var(--cd-color-bg-0, #fff);
    color: var(--cd-color-text-1, #4e5969);
    font-size: 13px;
    cursor: pointer;
  }
  .pager-btn:hover:not(:disabled) {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
  }
  .pager-btn.active {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
    font-weight: 600;
  }
  .pager-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
