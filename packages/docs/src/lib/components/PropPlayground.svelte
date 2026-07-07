<script lang="ts">
  interface Prop {
    name: string;
    type: string;
    default?: string;
    description?: string;
  }

  interface Props {
    props: Prop[];
    values: Record<string, unknown>;
    onchange: (values: Record<string, unknown>) => void;
  }

  import { untrack } from 'svelte';

  const { props, values, onchange }: Props = $props();

  function getControlType(prop: Prop): 'boolean' | 'union' | 'number' | 'string' | 'skip' {
    const t = prop.type ?? '';
    if (t === 'boolean') return 'boolean';
    if (/^number/.test(t)) return 'number';
    // 联合字面量：含单引号且含 | 符
    if (t.includes("'") && t.includes('|')) return 'union';
    if (t === 'string') return 'string';
    return 'skip'; // Snippet、复杂类型等跳过
  }

  function getUnionOptions(type: string): string[] {
    return type.split('|').map((s) => s.trim().replace(/'/g, '')).filter(Boolean);
  }

  function parseDefault(prop: Prop): unknown {
    const d = prop.default ?? '';
    if (d === 'true') return true;
    if (d === 'false') return false;
    const n = Number(d);
    if (!isNaN(n) && d !== '') return n;
    return d.replace(/^['"]|['"]$/g, '');
  }

  // 初始化 — 仅取父级 values 的初始快照，之后本地自持（untrack 明确不订阅后续更新）
  let localValues = $state<Record<string, unknown>>(untrack(() => ({ ...values })));

  function update(name: string, val: unknown) {
    localValues = { ...localValues, [name]: val };
    onchange(localValues);
  }
</script>

<div class="playground">
  <div class="playground__title">调试面板</div>
  {#each props as prop}
    {@const ctrl = getControlType(prop)}
    {#if ctrl !== 'skip'}
    <div class="ctrl-row">
      <label class="ctrl-label" for="ctrl-{prop.name}">{prop.name}</label>
      {#if ctrl === 'boolean'}
        <input
          id="ctrl-{prop.name}"
          type="checkbox"
          checked={!!localValues[prop.name]}
          onchange={(e) => update(prop.name, (e.target as HTMLInputElement).checked)}
        />
      {:else if ctrl === 'union'}
        <select
          id="ctrl-{prop.name}"
          value={String(localValues[prop.name] ?? '')}
          onchange={(e) => update(prop.name, (e.target as HTMLSelectElement).value)}
        >
          {#each getUnionOptions(prop.type) as opt}
            <option value={opt}>{opt}</option>
          {/each}
        </select>
      {:else if ctrl === 'number'}
        <input
          id="ctrl-{prop.name}"
          type="number"
          value={Number(localValues[prop.name] ?? 0)}
          oninput={(e) => update(prop.name, Number((e.target as HTMLInputElement).value))}
        />
      {:else}
        <input
          id="ctrl-{prop.name}"
          type="text"
          value={String(localValues[prop.name] ?? '')}
          oninput={(e) => update(prop.name, (e.target as HTMLInputElement).value)}
        />
      {/if}
    </div>
    {/if}
  {/each}
</div>

<style>
  .playground {
    background: var(--cd-color-bg-1, #f7f8fa);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    padding: 16px;
    min-width: 220px;
  }
  .playground__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .ctrl-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
  }
  .ctrl-label {
    color: var(--cd-color-text-0, #1f2329);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  select, input[type="text"], input[type="number"] {
    padding: 3px 6px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 4px;
    background: var(--cd-color-bg-0, #fff);
    color: var(--cd-color-text-0, #1f2329);
    font-size: 12px;
    max-width: 120px;
    width: 120px;
  }
  input[type="checkbox"] {
    width: 16px; height: 16px; cursor: pointer;
  }
</style>
