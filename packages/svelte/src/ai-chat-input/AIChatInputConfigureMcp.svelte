<!--
  AIChatInputConfigureMcp — 配置区 MCP 服务多选字段（对齐 Semi Configure.Mcp）。
  触发器显示「MCP · N」（N=已选数）；下拉菜单勾选启用的 MCP 服务，选中集写回 value[field]。
  用 field 绑定配置区 context。放在 AIChatInput 的 renderConfigureArea 里使用。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { Dropdown } from '../dropdown/index.js';
  import { getConfigureContext } from './configure-context.js';

  interface McpOption {
    label: string;
    value: string;
  }

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 可选 MCP 服务。 */
    options?: McpOption[];
    /** 初始已选（value 数组）。 */
    initValue?: string[] | undefined;
    /** 附加变更回调（已选 value 数组）。 */
    onChange?: ((selected: string[]) => void) | undefined;
  }

  let { field, options = [], initValue, onChange }: Props = $props();

  const ctx = getConfigureContext();

  // 仅挂载时注册初始值 + 卸载清理。untrack 切断对 configureValue 的追踪，避免
  // setField 写主组件 state → snippet 重渲染 → effect 重跑的自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const selected = $derived((ctx?.getValue()[field] as string[] | undefined) ?? []);

  // 已选项打勾（active，showTick 时显示对勾），点击 toggle。
  function handleSelect(value: string): void {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    ctx?.setField({ [field]: next });
    onChange?.(next);
  }
</script>

<Dropdown trigger="click" clickToHide={false} showTick>
  <button type="button" class="cd-ai-chat-input-configure-mcp-trigger">
    MCP · {selected.length}
  </button>
  {#snippet render()}
    <Dropdown.Menu>
      {#each options as o (o.value)}
        <Dropdown.Item
          key={o.value}
          active={selected.includes(o.value)}
          onClick={() => handleSelect(o.value)}
        >
          {o.label}
        </Dropdown.Item>
      {/each}
    </Dropdown.Menu>
  {/snippet}
</Dropdown>

<style>
  .cd-ai-chat-input-configure-mcp-trigger {
    appearance: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: var(--cd-ai-chat-input-action-padding) var(--cd-spacing-tight);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-ai-chat-input-action-radius);
    background: transparent;
    color: var(--cd-ai-chat-input-template-color);
    font: inherit;
    transition: background var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input-configure-mcp-trigger:hover {
    background: var(--cd-ai-chat-input-template-bg-hover);
  }

  .cd-ai-chat-input-configure-mcp-trigger:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
