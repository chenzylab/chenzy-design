<!--
  AIChatInputConfigureMcp — 配置区 MCP 服务多选字段（对齐 Semi Configure.Mcp）。
  触发器显示「MCP · N」（N=已选数）；下拉菜单勾选启用的 MCP 服务，选中集写回 value[field]。
  用 field 绑定配置区 context。放在 AIChatInput 的 renderConfigureArea 里使用。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { Button } from '../button/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getConfigureContext } from './configure-context.js';

  interface McpOption {
    label: string;
    value: string;
    /** 选项前置图标（对齐 Semi Dropdown.Item icon）。 */
    icon?: Snippet;
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
    /** 是否显示下拉头部的「配置」按钮（对齐 Semi showConfigure，默认 true）。 */
    showConfigure?: boolean;
    /** 点击头部「配置」按钮（对齐 Semi onConfigureButtonClick）。 */
    onConfigureButtonClick?: (() => void) | undefined;
  }

  let {
    field,
    options = [],
    initValue,
    onChange,
    showConfigure = true,
    onConfigureButtonClick,
  }: Props = $props();

  const ctx = getConfigureContext();
  const loc = useLocale();

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

<Dropdown
  className="cd-ai-chat-input-footer-configure-mcp"
  trigger="click"
  clickToHide={false}
  showTick
>
  <!-- 触发器用 Button（对齐 Semi theme=outline / type=tertiary）。
       计数取 options.length 与头部一致（Semi 触发器也是 options.length ?? num）。
       不照搬 Semi 的 onClick stopPropagation：本库 Dropdown 的 click 触发挂在外层靠冒泡，
       在触发器上截流会让下拉根本打不开（实测 aria-expanded 恒 false）。 -->
  <Button
    theme="outline"
    type="tertiary"
    class="cd-ai-chat-input-footer-configure-mcp-trigger"
  >
    MCP · {options.length}
  </Button>
  {#snippet render()}
    <!-- 头部：已选计数 + 配置按钮（对齐 Semi mcp.tsx 的 -mcp-header）。
         计数取 options.length，与 Semi 的 `options.length ?? num` 同源。 -->
    <div class="cd-ai-chat-input-footer-configure-mcp-header">
      <span class="cd-ai-chat-input-footer-configure-mcp-header-title">
        {loc().t('AIChatInput.selected').replace('${count}', String(options.length))}
      </span>
      {#if showConfigure}
        <Button
          theme="outline"
          class="cd-ai-chat-input-footer-configure-mcp-header-config"
          onclick={() => onConfigureButtonClick?.()}
        >
          {loc().t('AIChatInput.configure')}
        </Button>
      {/if}
    </div>
    <Dropdown.Menu>
      {#each options as o (o.value)}
        <Dropdown.Item
          key={o.value}
          icon={o.icon}
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
  /* 头部：Semi &-footer-configure-mcp-header（下拉面板由 Dropdown portal 到 body，
     且这些节点在 Dropdown 子组件作用域内，故一律 :global 打洞）。 */
  :global(.cd-ai-chat-input-footer-configure-mcp-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--cd-height-ai-chat-input-footer-configure-mcp-header);
    padding: var(--cd-spacing-ai-chat-input-footer-configure-mcp-header-paddingtop)
      var(--cd-spacing-ai-chat-input-footer-configure-mcp-header-paddingx)
      var(--cd-spacing-ai-chat-input-footer-configure-mcp-header-paddingbottom);
    column-gap: var(--cd-spacing-ai-chat-input-footer-configure-mcp-columngap);
    /* Semi @include font-size-small 连带 line-height（见 semi-font-size-mixin 记忆）。 */
    font-size: var(--cd-font-size-small);
    line-height: 16px;
  }

  :global(.cd-ai-chat-input-footer-configure-mcp-header-title) {
    color: var(--cd-color-ai-chat-input-footer-configure-mcp-header-title-text);
  }

  /* Semi 用 `&-config.#{$prefix}-button` 提特异性压掉 Button 自带 padding/border。 */
  :global(.cd-ai-chat-input-footer-configure-mcp-header-config.cd-button) {
    padding: 0;
    border: 0;
    height: fit-content;
    font-size: var(--cd-font-size-small);
    line-height: 16px;
  }
</style>
