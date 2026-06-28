<script lang="ts">
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import DesignTokenTable from '$lib/components/DesignTokenTable.svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { resolveTokenPrefix } from '$lib/token-prefix';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);
  const lang = $derived(locale.value);

  const lowerName = $derived(meta.name.toLowerCase());
  const tokenComponent = $derived(resolveTokenPrefix(lowerName));

  const a11y = $derived(meta.a11y ?? null);
  const a11yRole = $derived(typeof a11y?.role === 'string' ? a11y.role : null);
  const a11yNotes = $derived<string[]>(a11y?.notes ?? (a11y?.note ? [a11y.note] : []));
  const a11yPattern = $derived(meta.a11yPattern ?? a11y?.pattern ?? null);
  const apgRef = $derived(meta.apgRef ?? null);

  const usageHints = $derived(meta.usageHints ?? null);
  const dangerousActions = $derived(meta.dangerousActions ?? null);
  const validNames = new Set(
    Object.values(componentsJson.components).map((m: any) => m.name.toLowerCase()),
  );
  const relatedComponents = $derived<string[]>(
    (meta.relatedComponents ?? []).filter((rc: string) => validNames.has(rc.toLowerCase())),
  );
</script>

<svelte:head>
  <title>{meta.name} · {t('tab.design', lang)} — chenzy-design</title>
</svelte:head>

<div class="design-doc" data-pagefind-body>
  <div class="dd-header">
    <div class="breadcrumb">
      <a href="{base}/components/{lowerName}">{meta.name}</a>
      <span> / </span>
      <span>{t('tab.design', lang)}</span>
    </div>
    <h1>{meta.name} <span class="dd-sub">设计文档</span></h1>
    <p class="description">{meta.description}</p>
    <a class="back-api" href="{base}/components/{lowerName}">← {t('tab.api', lang)}</a>
  </div>

  <!-- 何时使用 / 用法建议 -->
  <section class="dd-section">
    <h2>{t('content.usage', lang)}</h2>
    {#if usageHints}
      <p class="dd-text">{usageHints}</p>
    {:else}
      <p class="dd-text muted">
        {meta.description}
      </p>
    {/if}
    {#if dangerousActions}
      <h3>{t('content.danger', lang)}</h3>
      <p class="dd-text">{dangerousActions}</p>
    {/if}
  </section>

  <!-- Accessibility -->
  {#if a11yRole || a11yNotes.length || a11yPattern}
    <section class="dd-section">
      <h2>{t('section.a11y', lang)}</h2>
      {#if a11yRole}
        <p class="dd-text"><strong>{t('a11y.role', lang)}：</strong><code>{a11yRole}</code></p>
      {/if}
      {#if a11yNotes.length}
        <ul class="dd-notes">
          {#each a11yNotes as note (note)}<li>{note}</li>{/each}
        </ul>
      {/if}
      {#if apgRef}
        <p class="dd-text muted">{t('a11y.apg', lang)}：<code>{apgRef}</code></p>
      {/if}
    </section>
  {/if}

  <!-- 设计变量 -->
  <section class="dd-section">
    <h2>{t('section.tokens', lang)}</h2>
    <DesignTokenTable component={tokenComponent} />
  </section>

  <!-- 相关组件 -->
  {#if relatedComponents.length}
    <section class="dd-section">
      <h2>{t('content.related', lang)}</h2>
      <div class="related">
        {#each relatedComponents as rc (rc)}
          <a class="related-chip" href="{base}/components/{rc.toLowerCase()}">{rc}</a>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .design-doc {
    max-width: 880px;
  }
  .dd-header {
    margin-bottom: 40px;
  }
  .breadcrumb {
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    margin-bottom: 8px;
  }
  .breadcrumb a {
    color: inherit;
    text-decoration: none;
  }
  .breadcrumb a:hover {
    color: var(--cd-color-primary, #165dff);
  }
  h1 {
    font-size: 28px;
    margin: 0 0 8px;
  }
  .dd-sub {
    font-size: 16px;
    color: var(--cd-color-text-2, #86909c);
    font-weight: 400;
    margin-left: 8px;
  }
  .description {
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 12px;
    line-height: 1.7;
  }
  .back-api {
    font-size: 13px;
    color: var(--cd-color-primary, #165dff);
    text-decoration: none;
  }
  .dd-section {
    margin-bottom: 44px;
  }
  h2 {
    font-size: 18px;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  h3 {
    font-size: 15px;
    margin: 20px 0 8px;
  }
  .dd-text {
    line-height: 1.7;
    color: var(--cd-color-text-0, #1f2329);
    margin: 0 0 8px;
  }
  .dd-text.muted {
    color: var(--cd-color-text-2, #86909c);
  }
  .dd-text code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }
  .dd-notes {
    margin: 0 0 8px;
    padding-left: 20px;
  }
  .dd-notes li {
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: 6px;
  }
  .related {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .related-chip {
    display: inline-block;
    padding: 4px 12px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 16px;
    font-size: 13px;
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
  }
  .related-chip:hover {
    border-color: var(--cd-color-primary, #165dff);
    color: var(--cd-color-primary, #165dff);
  }
</style>
