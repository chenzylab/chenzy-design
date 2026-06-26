<script lang="ts">
  import componentsJson from '@chenzy-design/svelte/components.json';

  const categoryLabels: Record<string, string> = {
    basic: '基础',
    input: '输入',
    navigation: '导航',
    show: '展示',
    feedback: '反馈',
    other: '其他',
  };

  const categoryOrder = ['basic', 'input', 'navigation', 'show', 'feedback', 'other'];

  const grouped = Object.entries(componentsJson.components).reduce(
    (acc, [, meta]) => {
      const cat = (meta as any).category ?? 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(meta as any);
      return acc;
    },
    {} as Record<string, any[]>
  );
</script>

<svelte:head>
  <title>组件总览 — chenzy-design</title>
</svelte:head>

<h1>组件总览</h1>

{#each categoryOrder as cat}
  {#if grouped[cat]}
    <h2>{categoryLabels[cat] ?? cat}</h2>
    <div class="component-grid">
      {#each grouped[cat] as comp}
        <a href="/components/{comp.name.toLowerCase()}" class="component-card">
          <div class="card-name">{comp.name}</div>
          <div class="card-desc">{comp.description}</div>
        </a>
      {/each}
    </div>
  {/if}
{/each}

<style>
  h1 { font-size: 28px; margin-bottom: 24px; }
  h2 { font-size: 18px; margin: 32px 0 16px; color: var(--cd-color-text-0, #1f2329); }
  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  .component-card {
    display: block;
    padding: 16px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    text-decoration: none;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .component-card:hover {
    border-color: var(--cd-color-primary, #165dff);
    box-shadow: 0 2px 8px rgba(22,93,255,0.12);
  }
  .card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
    margin-bottom: 4px;
  }
  .card-desc {
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    line-height: 1.5;
  }
</style>
