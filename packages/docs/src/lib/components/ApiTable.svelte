<script lang="ts">
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
  <h3>Props</h3>
  <table class="api-table">
    <thead>
      <tr>
        <th>属性</th>
        <th>类型</th>
        <th>默认值</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      {#each props as prop}
        <tr>
          <td><code>{prop.name}</code></td>
          <td><code class="type">{prop.type}</code></td>
          <td>{prop.default ?? '—'}</td>
          <td>{prop.desc ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

{#if events.length}
<div class="api-table-wrap">
  <h3>Events</h3>
  <table class="api-table">
    <thead>
      <tr><th>事件</th><th>载荷</th><th>说明</th></tr>
    </thead>
    <tbody>
      {#each events as evt}
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
  <h3>Slots</h3>
  <table class="api-table">
    <thead>
      <tr><th>名称</th><th>说明</th></tr>
    </thead>
    <tbody>
      {#each slots as slot}
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
  code.type { color: var(--cd-color-primary, #165dff); background: transparent; }
</style>
