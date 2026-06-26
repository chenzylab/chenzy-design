<script lang="ts">
  import type { PageData } from './$types';
  import ApiTable from '$lib/components/ApiTable.svelte';
  import TokenTable from '$lib/components/TokenTable.svelte';

  const { data }: { data: PageData } = $props();
  const { meta } = data;
</script>

<svelte:head>
  <title>{meta.name} — chenzy-design</title>
</svelte:head>

<div class="component-header">
  <div class="breadcrumb">
    <a href="/components">组件</a>
    <span> / </span>
    <span>{meta.category}</span>
  </div>
  <h1>{meta.name}</h1>
  <p class="description">{meta.description}</p>
</div>

<section class="section">
  <h2>API 参考</h2>
  <ApiTable props={meta.props ?? []} events={meta.events ?? []} slots={meta.slots ?? []} />
</section>

{#if meta.tokens?.length}
<section class="section">
  <h2>Design Tokens</h2>
  <TokenTable tokens={meta.tokens} />
</section>
{/if}

<style>
  .component-header { margin-bottom: 32px; }
  .breadcrumb { font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-bottom: 8px; }
  .breadcrumb a { color: inherit; text-decoration: none; }
  .breadcrumb a:hover { color: var(--cd-color-primary, #165dff); }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .description { color: var(--cd-color-text-1, #4e5969); margin: 0 0 24px; }
  .section { margin-bottom: 40px; }
  h2 { font-size: 18px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--cd-color-border, #e5e7eb); }
</style>
