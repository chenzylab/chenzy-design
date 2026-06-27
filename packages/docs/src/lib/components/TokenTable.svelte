<script lang="ts">
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  const { tokens = [] }: { tokens?: string[] } = $props();
</script>

<table class="token-table">
  <thead>
    <tr><th>{t('token.prefix', lang)}</th><th>{t('api.desc', lang)}</th></tr>
  </thead>
  <tbody>
    {#each tokens as token (token)}
      <tr>
        <td><code>{token}</code></td>
        <td>{t('token.desc', lang)}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .token-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .token-table th {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .token-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 4px;
    border-radius: 3px;
  }
</style>
