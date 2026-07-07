<script lang="ts">
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  interface PropMeta {
    name: string;
    type: string;
    default?: string;
    desc?: string;
  }
  interface EventMeta {
    name: string;
    payload?: string;
    desc?: string;
  }
  interface SlotMeta {
    name: string;
    desc?: string;
  }

  const {
    props = [],
    events = [],
    slots = [],
  }: {
    props?: PropMeta[];
    events?: EventMeta[];
    slots?: SlotMeta[];
  } = $props();
</script>

{#if props.length}
<div class="api-table-wrap">
  <h3>{t('api.props', lang)}</h3>
  <table class="api-table">
    <thead>
      <tr>
        <th>{t('api.name', lang)}</th>
        <th>{t('api.desc', lang)}</th>
        <th>{t('api.type', lang)}</th>
        <th>{t('api.default', lang)}</th>
      </tr>
    </thead>
    <tbody>
      <!-- key 用 index：同一表格可含多子组件的同名 prop（如 Grid 的 Row.class / Col.class），
           用 prop.name 作 key 会重复触发 each_key_duplicate。行顺序稳定，index 安全。 -->
      {#each props as prop, i (i)}
        <tr>
          <td><code>{prop.name}</code></td>
          <td>{prop.desc ?? '—'}</td>
          <td><code class="type">{prop.type}</code></td>
          <td>{prop.default ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

{#if events.length}
<div class="api-table-wrap">
  <h3>{t('api.events', lang)}</h3>
  <table class="api-table">
    <thead>
      <tr><th>{t('api.event', lang)}</th><th>{t('api.payload', lang)}</th><th>{t('api.desc', lang)}</th></tr>
    </thead>
    <tbody>
      {#each events as evt, i (i)}
        <tr>
          <td><code>{evt.name}</code></td>
          <td><code class="type">{evt.payload ?? '—'}</code></td>
          <td>{evt.desc ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

{#if slots.length}
<div class="api-table-wrap">
  <h3>{t('api.slots', lang)}</h3>
  <table class="api-table">
    <thead>
      <tr><th>{t('api.slotName', lang)}</th><th>{t('api.desc', lang)}</th></tr>
    </thead>
    <tbody>
      {#each slots as slot, i (i)}
        <tr>
          <td><code>{slot.name}</code></td>
          <td>{slot.desc ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

<style>
  .api-table-wrap { margin-bottom: 24px; }
  h3 { font-size: 15px; margin: 0 0 8px; color: var(--cd-color-text-1, #4e5969); }
  .api-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .api-table th {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .api-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
  }
  .api-table tr:last-child td { border-bottom: none; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 4px;
    border-radius: 3px;
  }
  code.type { color: var(--cd-color-primary, #0064fa); background: transparent; }
</style>
