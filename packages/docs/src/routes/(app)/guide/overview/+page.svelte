<script lang="ts">
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { componentNamesZh } from '$lib/component-names-zh';
  import SidebarIcon from '$lib/components/SidebarIcon.svelte';

  const lang = $derived(locale.value);
  const count = componentsJson.count;

  const categoryOrder = ['ai', 'basic', 'plus', 'input', 'navigation', 'show', 'feedback', 'other'];

  const grouped = Object.entries(componentsJson.components).reduce(
    (acc, [, meta]) => {
      const cat = (meta as { category?: string }).category ?? 'other';
      (acc[cat] ??= []).push(meta as { name: string; category?: string });
      return acc;
    },
    {} as Record<string, { name: string; category?: string }[]>,
  );
</script>

<svelte:head>
  <title>{t('overview.headTitle', lang)} — chenzy-design</title>
</svelte:head>

<div class="overview">
  <h1>{t('overview.title', lang)}</h1>
  <p class="intro">{t('overview.intro', lang, { n: count })}</p>

  {#each categoryOrder as cat (cat)}
    {#if grouped[cat]}
      <h2>
        {t(`cat.${cat}`, lang)}
        <span class="cat-count">{grouped[cat].length}</span>
      </h2>
      <div class="ov-grid">
        {#each grouped[cat] as comp (comp.name)}
          {@const name = comp.name.toLowerCase()}
          <a href="{base}/components/{name}" class="ov-card">
            <SidebarIcon {name} category={comp.category ?? 'other'} />
            <span class="ov-card-text">
              <span class="ov-card-en">{comp.name}</span>
              {#if lang === 'zh' && componentNamesZh[name]}
                <span class="ov-card-zh">{componentNamesZh[name]}</span>
              {/if}
            </span>
          </a>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .overview {
    max-width: 100%;
  }
  h1 {
    font-size: 28px;
    margin: 0 0 12px;
  }
  .intro {
    color: var(--cd-color-text-1, #4e5969);
    line-height: 1.7;
    margin: 0 0 32px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    margin: 36px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    color: var(--cd-color-text-0, #1f2329);
  }
  .cat-count {
    font-size: 12px;
    font-weight: 500;
    color: var(--cd-color-text-2, #86909c);
    background: var(--cd-color-fill-1, #f2f3f5);
    border-radius: 10px;
    padding: 1px 8px;
  }
  .ov-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }
  .ov-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 10px;
    text-decoration: none;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .ov-card:hover {
    border-color: var(--cd-color-primary, #0064fa);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
  .ov-card-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }
  .ov-card-en {
    font-size: 14px;
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ov-card-zh {
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
  }
</style>
